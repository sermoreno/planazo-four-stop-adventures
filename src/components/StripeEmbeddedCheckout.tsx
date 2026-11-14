import { useCallback, useMemo } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripe, getStripeEnvironment } from '@/lib/stripe';
import { createCheckoutSession } from '@/features/planazo/payments.functions';
import { PREMIUM_PRICE_ID } from '@/features/planazo/subscription-access';

export function StripeEmbeddedCheckout({ returnUrl }: { returnUrl: string }) {
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const result = await createCheckoutSession({
      data: { priceId: PREMIUM_PRICE_ID, returnUrl, environment: getStripeEnvironment() },
    });
    if ('error' in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error('No se pudo iniciar el pago.');
    return result.clientSecret;
  }, [returnUrl]);
  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  return (
    <div id="checkout" className="checkout-panel">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
