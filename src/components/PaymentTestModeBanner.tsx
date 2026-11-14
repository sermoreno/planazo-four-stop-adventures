const clientToken = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="payment-test-banner" role="alert">
        Los pagos aún no están configurados en esta versión. Completa la activación antes de aceptar cobros reales.
      </div>
    );
  }
  if (clientToken.startsWith('pk_test_')) {
    return (
      <div className="payment-test-banner" role="status">
        Pagos en modo de prueba: no se realizarán cargos reales.{' '}
        <a href="https://docs.lovable.dev/features/payments#test-and-live-environments" target="_blank" rel="noopener noreferrer">
          Más información
        </a>
      </div>
    );
  }
  return null;
}
