import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bookmark, Check, Crown, Map, Route as RouteIcon, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Header, Footer } from '@/features/planazo/header';
import { Button } from '@/components/ui/button';
import { usePlanazo } from '@/features/planazo/context';
import { useSubscription } from '@/features/planazo/use-subscription';
import { createPortalSession } from '@/features/planazo/payments.functions';
import { StripeEmbeddedCheckout } from '@/components/StripeEmbeddedCheckout';

export const Route = createFileRoute('/precios')({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    ...(typeof search['session_id'] === 'string' ? { session_id: search['session_id'] } : {}),
  }),
  head: () => ({ meta: [
    { title: 'Precios Free y Premium · Planazo' },
    { name: 'description', content: 'Guarda tres planes gratis o disfruta de planes sin límite con Planazo Premium por 4,99 € al mes.' },
    { property: 'og:title', content: 'Precios Free y Premium · Planazo' },
    { property: 'og:description', content: 'Tres planes gratis o planes sin límite por 4,99 € al mes.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Pricing,
});

const freeFeatures = ['Hasta 3 planes guardados', 'Itinerarios de cuatro paradas', 'Mapas y recorridos a pie', 'Previsión del tiempo'];
const premiumFeatures = ['Planes guardados sin límite', 'Todo lo incluido en Free', 'Gestión de la suscripción', 'Cancela cuando quieras'];

function FeatureList({ items }: { items: string[] }) {
  return <ul className="pricing-features">{items.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>;
}

function Pricing() {
  const { user, authReady } = usePlanazo();
  const { subscription, isPremium, environment, isLoading } = useSubscription();
  const { session_id: sessionId } = Route.useSearch();
  const queryClient = useQueryClient();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isPremium) setCheckoutUrl(null);
  }, [isPremium]);

  useEffect(() => {
    if (!sessionId || !user || isPremium) return;
    void queryClient.invalidateQueries({ queryKey: ['subscription', user.id, environment] });
    const timer = window.setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: ['subscription', user.id, environment] });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [sessionId, user, isPremium, environment, queryClient]);

  async function openPortal() {
    setBusy(true);
    try {
      const result = await createPortalSession({ data: {
        environment,
        returnUrl: `${window.location.origin}/precios`,
      } });
      if ('error' in result) throw new Error(result.error);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo abrir la gestión de la suscripción.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <Header />
    <main className="page-width content-page pricing-page">
      <div className="pricing-intro">
        <div className="step-label"><Crown size={14} /> MÁS PLANAZOS, A TU MANERA</div>
        <h1>Empieza gratis. Sigue sin límites.</h1>
        <p>Elige cómo guardar tus recorridos por Madrid. Sin compromiso y con todo claro antes de pagar.</p>
      </div>

      {sessionId && <div className="subscription-notice" role="status">
        {isPremium ? 'Tu suscripción Premium ya está activa.' : 'Pago completado. Estamos confirmando la activación de tu suscripción; puede tardar unos segundos.'}
      </div>}
      {subscription?.status === 'past_due' && isPremium && <div className="subscription-notice" role="alert">
        Hay un problema con el último cobro. Revisa tu método de pago para mantener Premium.
      </div>}

      <div className="pricing-grid">
        <article className={`pricing-card ${!isPremium ? 'current' : ''}`}>
          <div className="pricing-card-heading"><Bookmark aria-hidden="true" /><span>Free</span>{user && !isPremium && <small>Tu plan actual</small>}</div>
          <div className="price"><strong>0 €</strong><span>para siempre</span></div>
          <p>Para descubrir Madrid y guardar tus primeras escapadas.</p>
          <FeatureList items={freeFeatures} />
          <Button variant="outline" className="pricing-action" asChild><Link to="/plan/nuevo">Crear un plan</Link></Button>
        </article>

        <article className={`pricing-card premium ${isPremium ? 'current' : ''}`}>
          <div className="pricing-card-heading"><Crown aria-hidden="true" /><span>Premium</span>{isPremium && <small>Tu plan actual</small>}</div>
          <div className="price"><strong>4,99 €</strong><span>al mes</span></div>
          <p>Para que ninguna buena idea se quede fuera de tu lista.</p>
          <FeatureList items={premiumFeatures} />
          {!authReady || isLoading ? <Button className="pricing-action" disabled>Cargando…</Button>
            : !user ? <Button className="pricing-action" asChild><Link to="/cuenta">Entrar para suscribirte</Link></Button>
            : isPremium ? <>
              {subscription?.cancel_at_period_end && subscription.current_period_end && <p className="renewal-note">Acceso hasta el {new Date(subscription.current_period_end).toLocaleDateString('es-ES')}.</p>}
              <Button className="pricing-action" disabled={busy} onClick={() => void openPortal()}><Settings />{busy ? 'Abriendo…' : 'Gestionar suscripción'}</Button>
            </>
            : <Button className="pricing-action" onClick={() => setCheckoutUrl(`${window.location.origin}/precios?session_id={CHECKOUT_SESSION_ID}`)}>
              Suscribirme a Premium
            </Button>}
          <small className="tax-note">Impuestos calculados antes de completar el pago.</small>
        </article>
      </div>

      {checkoutUrl && user && !isPremium && <section className="checkout-section" aria-label="Pago de Planazo Premium">
        <h2>Completa tu suscripción</h2>
        <p>El pago seguro se realiza aquí mismo. Podrás gestionarla o cancelarla cuando quieras.</p>
        <StripeEmbeddedCheckout returnUrl={checkoutUrl} />
        <Button variant="ghost" onClick={() => setCheckoutUrl(null)}>Volver a los precios</Button>
      </section>}

      <section className="pricing-notes" aria-label="Ventajas incluidas">
        <span><Map />Madrid, siempre como protagonista</span>
        <span><RouteIcon />Recorridos reales a pie</span>
        <span><Check />Sin permanencia</span>
      </section>
    </main>
    <Footer />
  </>;
}
