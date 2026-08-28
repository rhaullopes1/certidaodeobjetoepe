const CONVERSION_ID = "AW-18411209847/ZLw3CNazkOgcEPeIk8tE";

/**
 * Envia o evento de conversão do Google Ads para um pedido pago.
 * - Aguarda o carregamento do gtag caso ele ainda não esteja disponível.
 * - Deduplica por protocolo no localStorage para evitar envios repetidos em recargas.
 * - Inclui value/currency quando o valor em centavos for fornecido.
 */
export function sendGoogleAdsConversion(protocolo: string, valorCentavos?: number): void {
  if (typeof window === "undefined") return;

  const key = `ga_conversion_${protocolo}`;
  try {
    if (window.localStorage.getItem(key)) return;
  } catch {
    // ignore storage access errors
  }

  const payload: Record<string, unknown> = { send_to: CONVERSION_ID };
  if (typeof valorCentavos === "number" && valorCentavos > 0) {
    payload.value = valorCentavos / 100;
    payload.currency = "BRL";
  }

  const attempt = (): boolean => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) return false;

    gtag("event", "conversion", payload);

    try {
      window.localStorage.setItem(key, new Date().toISOString());
    } catch {
      // ignore storage write errors
    }

    return true;
  };

  if (attempt()) return;

  // Retry while the async gtag script finishes loading, up to ~5 seconds.
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 100;
    if (attempt() || elapsed >= 5000) {
      clearInterval(interval);
    }
  }, 100);
}
