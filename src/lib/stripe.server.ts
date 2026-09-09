// Integração Stripe — Checkout Session com cartão e Pix.

const API_BASE = "https://api.stripe.com/v1";

export const BASE_URL =
  process.env["PUBLIC_SITE_URL"] ?? "https://certidaodeobjetoepe.org";

export function temStripe() {
  return Boolean(process.env["STRIPE_SECRET_KEY"]);
}

function chave() {
  const k = process.env["STRIPE_SECRET_KEY"];
  if (!k) throw new Error("STRIPE_SECRET_KEY não configurada");
  return k;
}

/** Serializa objetos aninhados no formato de formulário exigido pela Stripe. */
function paraForm(dados: Record<string, unknown>, prefixo = ""): string[] {
  const partes: string[] = [];
  for (const [k, v] of Object.entries(dados)) {
    if (v === undefined || v === null) continue;
    const nome = prefixo ? `${prefixo}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object") partes.push(...paraForm(item as Record<string, unknown>, `${nome}[${i}]`));
        else partes.push(`${encodeURIComponent(`${nome}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof v === "object") {
      partes.push(...paraForm(v as Record<string, unknown>, nome));
    } else {
      partes.push(`${encodeURIComponent(nome)}=${encodeURIComponent(String(v))}`);
    }
  }
  return partes;
}

type StripeSession = {
  id?: string;
  url?: string | null;
  status?: string;
  payment_status?: string;
  expires_at?: number;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
  payment_intent?: { created?: number; status?: string } | string | null;
};

/**
 * Confere a assinatura enviada pela Stripe (cabeçalho `Stripe-Signature`).
 * Sem o segredo configurado, nada é aceito — evita processar avisos forjados.
 */
export async function assinaturaStripeValida(
  corpoBruto: string,
  cabecalho: string | null,
): Promise<boolean> {
  const segredo = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!segredo || !cabecalho) return false;

  const partes = Object.fromEntries(
    cabecalho.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  ) as Record<string, string>;

  const timestamp = partes["t"];
  const assinatura = partes["v1"];
  if (!timestamp || !assinatura) return false;

  // Rejeita avisos com mais de 5 minutos (proteção contra reenvio antigo).
  const idade = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(idade) || idade > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${corpoBruto}`));
  const esperado = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (esperado.length !== assinatura.length) return false;
  let diff = 0;
  for (let i = 0; i < esperado.length; i++) diff |= esperado.charCodeAt(i) ^ assinatura.charCodeAt(i);
  return diff === 0;
}

export function temSegredoWebhookStripe() {
  return Boolean(process.env["STRIPE_WEBHOOK_SECRET"]);
}


async function stripe(
  path: string,
  opcoes?: { corpo?: Record<string, unknown>; idempotencyKey?: string },
): Promise<StripeSession> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${chave()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (opcoes?.idempotencyKey) headers["Idempotency-Key"] = opcoes.idempotencyKey;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opcoes?.corpo ? "POST" : "GET",
    headers,
    body: opcoes?.corpo ? paraForm(opcoes.corpo).join("&") : undefined,
  });
  const texto = await res.text();
  if (!res.ok) {
    console.error(`Stripe ${path} falhou [${res.status}]: ${texto}`);
    throw new Error(`Stripe respondeu ${res.status}`);
  }
  return texto ? (JSON.parse(texto) as StripeSession) : {};
}

export type CobrancaStripe = {
  sessionId: string;
  checkoutUrl: string;
  expiraEm: string | null;
};

/** Cria a sessão de checkout (cartão + Pix) para o pedido. */
export async function criarCheckout(pedido: {
  protocolo: string;
  email: string;
  quantidade: number;
  valorCentavos: number;
}): Promise<CobrancaStripe> {
  // Stripe aceita expiração entre 30 minutos e 24 horas.
  const expiraEmSegundos = Math.floor(Date.now() / 1000) + 23 * 60 * 60;


  const corpoBase = (metodos: string[] | null) => ({
    mode: "payment",
    // Sem lista fixa, a Stripe usa os meios habilitados na conta.
    ...(metodos ? { payment_method_types: metodos } : {}),
    client_reference_id: pedido.protocolo,
      customer_email: pedido.email,
      expires_at: expiraEmSegundos,
      locale: "pt-BR",
      metadata: { protocolo: pedido.protocolo },
      payment_intent_data: {
        description: `Certidão de Objeto e Pé - ${pedido.protocolo}`,
        metadata: { protocolo: pedido.protocolo },
      },
      success_url: `${BASE_URL}/pedido/${pedido.protocolo}?pagamento=ok`,
      cancel_url: `${BASE_URL}/pedido/${pedido.protocolo}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: pedido.valorCentavos,
            product_data: {
              name:
                pedido.quantidade > 1
                  ? `${pedido.quantidade} Certidões de Objeto e Pé`
                  : "Certidão de Objeto e Pé",
              description: `Protocolo ${pedido.protocolo}`,
            },
          },
        },
    ],
  });

  // Sem lista fixa: a Stripe oferece todos os meios habilitados na conta
  // (cartão, Apple Pay, Google Pay e, assim que liberado, Pix).
  // A chave de idempotência tem janela de 5 minutos: protege contra duplo
  // clique/reenvio, mas permite gerar um novo link quando o anterior vence.
  const janela = Math.floor(Date.now() / (5 * 60 * 1000));
  const sessao: StripeSession = await stripe("/checkout/sessions", {
    idempotencyKey: `checkout-${pedido.protocolo}-${janela}`,
    corpo: corpoBase(null),
  });


  if (!sessao.id || !sessao.url) throw new Error("Stripe não retornou o link de pagamento");

  return {
    sessionId: sessao.id,
    checkoutUrl: sessao.url,
    expiraEm: sessao.expires_at ? new Date(sessao.expires_at * 1000).toISOString() : null,
  };
}

/**
 * Consulta a sessão na Stripe — fonte da verdade sobre o pagamento.
 * Sessão vencida NÃO cancela o pedido: apenas indica que é preciso gerar
 * um novo link de pagamento (o prazo do pedido é de DIAS_PARA_EXPIRAR dias).
 */
export async function consultarCheckout(sessionId: string) {
  const sessao = await stripe(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
  return {
    pago: sessao.payment_status === "paid" || sessao.payment_status === "no_payment_required",
    expirado: sessao.status === "expired",
    pagoEm: null as string | null,
    referenceId: sessao.client_reference_id ?? sessao.metadata?.["protocolo"] ?? null,
  };
}
