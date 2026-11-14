import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from '@/lib/stripe.server';
import { PREMIUM_PRICE_ID } from './subscription-access';

const environmentSchema = z.enum(['sandbox', 'live']);
type PaymentResult = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error('Invalid userId');
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    const customer = found.data[0];
    if (customer) return customer.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { priceId: string; returnUrl: string; environment: StripeEnv }) => z.object({
    priceId: z.literal(PREMIUM_PRICE_ID),
    returnUrl: z.string().url().max(2000),
    environment: environmentSchema,
  }).parse(input))
  .handler(async ({ data, context }): Promise<PaymentResult> => {
    try {
      const { data: alreadyPremium, error: accessError } = await context.supabase.rpc('has_active_subscription', {
        user_uuid: context.userId,
        check_env: data.environment,
      });
      if (accessError) return { error: accessError.message };
      if (alreadyPremium) return { error: 'Ya tienes una suscripción Premium activa. Gestiona tu suscripción desde Precios.' };

      const { data: { user } } = await context.supabase.auth.getUser();
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice || stripePrice.type !== 'recurring') return { error: 'No se encontró el precio de Planazo Premium.' };
      const customerId = await resolveOrCreateCustomer(stripe, {
        email: user?.email ?? undefined,
        userId: context.userId,
      });
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: 'subscription',
        ui_mode: 'embedded_page',
        return_url: data.returnUrl,
        customer: customerId,
        automatic_tax: { enabled: true },
        metadata: { userId: context.userId, managed_payments: 'false' },
        subscription_data: { metadata: { userId: context.userId } },
      });
      if (!session.client_secret) return { error: 'El pago no devolvió una sesión válida.' };
      return { clientSecret: session.client_secret };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createPortalSession = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { returnUrl?: string; environment: StripeEnv }) => z.object({
    returnUrl: z.string().url().max(2000).optional(),
    environment: environmentSchema,
  }).parse(input))
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { data: subscription, error } = await context.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', context.userId)
      .eq('environment', data.environment)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!subscription?.stripe_customer_id) return { error: 'Todavía no hay ninguna suscripción que gestionar.' };
    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
