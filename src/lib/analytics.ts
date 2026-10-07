/**
 * Eventos do funil (em ordem):
 *  1. begin_checkout   — abriu o formulário de solicitação (trackBeginCheckout)
 *  2. generate_lead    — pedido criado; página do protocolo aberta (trackGenerateLead)
 *  3. add_payment_info — cliente iniciou pagamento: copiou o Pix ou abriu o cartão (trackPaymentStart)
 *  4. conversion       — PAGAMENTO CONFIRMADO. Este é o ÚNICO evento de conversão final
 *                        ("Pedido Pago - Site"), disparado só com status "pago" (sendGoogleAdsConversion).
 * Os eventos 1–3 são sinais intermediários e não devem ser marcados como conversão principal.
 */
// Ação de conversão "Pedido Pago - Site" (categoria Compra) no Google Ads.
const CONVERSION_ID = "AW-18411209847/KbQeCJ2cn4MdEPeIk8tE";
const ADS_ACCOUNT = "AW-18411209847";

function withGtag(run: (gtag: (...args: unknown[]) => void) => void): void {
  if (typeof window === "undefined") return;

  const attempt = () => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) return false;
    run(gtag);
    return true;
  };

  if (attempt()) return;

  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += 100;
    if (attempt() || elapsed >= 5000) clearInterval(interval);
  }, 100);
}

function once(key: string, run: () => void): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    // ignore storage errors
  }
  run();
}

/** Evento de início de solicitação (abertura do formulário). */
export function trackBeginCheckout(): void {
  once("ga_begin_checkout", () => {
    withGtag((gtag) =>
      gtag("event", "begin_checkout", { send_to: ADS_ACCOUNT, currency: "BRL" }),
    );
  });
}

/** Contato enviado pelo formulário da home (antes de abrir o WhatsApp). */
export function trackContactLead(): void {
  withGtag((gtag) =>
    gtag("event", "contact", { send_to: ADS_ACCOUNT, currency: "BRL" }),
  );
}

/** Evento de pedido criado (lead), disparado ao abrir a página do protocolo. */
export function trackGenerateLead(protocolo: string, valorCentavos?: number): void {
  once(`ga_lead_${protocolo}`, () => {
    withGtag((gtag) =>
      gtag("event", "generate_lead", {
        send_to: ADS_ACCOUNT,
        currency: "BRL",
        value: typeof valorCentavos === "number" && valorCentavos > 0 ? valorCentavos / 100 : undefined,
        transaction_id: protocolo,
      }),
    );
  });
}

/** Pagamento iniciado (Pix copiado ou cartão aberto). Sinal intermediário, NÃO é conversão final. */
export function trackPaymentStart(protocolo: string, metodo: "pix" | "cartao", valorCentavos?: number): void {
  once(`ga_payment_start_${metodo}_${protocolo}`, () => {
    withGtag((gtag) =>
      gtag("event", "add_payment_info", {
        send_to: ADS_ACCOUNT,
        currency: "BRL",
        payment_type: metodo,
        value: typeof valorCentavos === "number" && valorCentavos > 0 ? valorCentavos / 100 : undefined,
        transaction_id: protocolo,
      }),
    );
  });
}

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

  const payload: Record<string, unknown> = {
    send_to: CONVERSION_ID,
    transaction_id: protocolo,
  };

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
