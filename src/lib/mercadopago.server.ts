// Integração Mercado Pago — cobrança Pix dinâmica com QR Code e webhook.

const API_BASE = "https://api.mercadopago.com";

// Domínio oficial: o endereço *.lovable.app redireciona (307) para cá, e o
// Mercado Pago NÃO segue redirecionamentos — as notificações se perdiam.
export const BASE_URL =
  process.env["PUBLIC_SITE_URL"] ?? "https://certidaodeobjetoepe.org";

export function temMercadoPago() {
  return Boolean(process.env["MERCADOPAGO_ACCESS_TOKEN"]);
}

function token() {
  const t = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return t;
}

type MPPayment = {
  id?: number | string;
  status?: string;
  status_detail?: string;
  date_approved?: string | null;
  external_reference?: string | null;
  date_of_expiration?: string | null;
  point_of_interaction?: {
    transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string };
  };
};

async function mp(path: string, init?: RequestInit): Promise<MPPayment> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const texto = await res.text();
  if (!res.ok) {
    console.error(`Mercado Pago ${path} falhou [${res.status}]: ${texto}`);
    throw new Error(`Mercado Pago respondeu ${res.status}`);
  }
  return texto ? (JSON.parse(texto) as MPPayment) : {};
}

export type CobrancaPix = {
  orderId: string;
  codigo: string;
  qrCodeUrl: string | null;
  expiraEm: string | null;
};

export async function criarCobrancaPix(pedido: {
  protocolo: string;
  nomeCliente?: string;
  email: string;
  cpf: string;
  whatsapp: string;
  valorCentavos: number;
}): Promise<CobrancaPix> {
  const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const pagamento = await mp("/v1/payments", {
    method: "POST",
    headers: { "X-Idempotency-Key": pedido.protocolo },
    body: JSON.stringify({
      transaction_amount: Number((pedido.valorCentavos / 100).toFixed(2)),
      description: `Certidão de Objeto e Pé - ${pedido.protocolo}`,
      payment_method_id: "pix",
      external_reference: pedido.protocolo,
      notification_url: `${BASE_URL}/api/public/webhooks/mercadopago`,
      date_of_expiration: expiracao,
      payer: {
        email: pedido.email,
        first_name: pedido.nomeCliente || `Cliente ${pedido.protocolo}`,
        identification: { type: "CPF", number: pedido.cpf.replace(/\D/g, "") },
      },
    }),
  });

  const dados = pagamento.point_of_interaction?.transaction_data;
  if (!pagamento.id || !dados?.qr_code) {
    throw new Error("Mercado Pago não retornou o QR Code Pix");
  }

  return {
    orderId: String(pagamento.id),
    codigo: dados.qr_code,
    qrCodeUrl: dados.qr_code_base64 ? `data:image/png;base64,${dados.qr_code_base64}` : null,
    expiraEm: pagamento.date_of_expiration ?? expiracao,
  };
}

/** Consulta o pagamento no Mercado Pago — fonte da verdade sobre o pagamento. */
export async function consultarCobranca(paymentId: string) {
  const pagamento = await mp(`/v1/payments/${encodeURIComponent(paymentId)}`);
  const status = pagamento.status ?? "";
  return {
    status,
    pago: status === "approved",
    cancelado: status === "cancelled" || status === "rejected" || status === "refunded",
    pagoEm: pagamento.date_approved ?? null,
    referenceId: pagamento.external_reference ?? null,
    paymentId: pagamento.id ? String(pagamento.id) : paymentId,
  };
}

export type CheckoutCartao = {
  preferenceId: string;
  checkoutUrl: string;
  expiraEm: string | null;
};

/**
 * Cria o checkout de cartão (Checkout Pro) no Mercado Pago.
 * O Pix continua sendo gerado à parte (Opção 1), por isso o meio "pix"
 * é excluído aqui para o link ser exclusivamente de cartão.
 */
export async function criarCheckoutCartao(pedido: {
  protocolo: string;
  email: string;
  quantidade: number;
  valorCentavos: number;
}): Promise<CheckoutCartao> {
  const expiraEm = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Idempotency-Key": `pref-${pedido.protocolo}`,
    },
    body: JSON.stringify({
      external_reference: pedido.protocolo,
      notification_url: `${BASE_URL}/api/public/webhooks/mercadopago`,
      statement_descriptor: "CERTIDAO OBJ E PE",
      expires: true,
      expiration_date_to: expiraEm,
      payer: { email: pedido.email },
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }],
        installments: 12,
      },
      back_urls: {
        success: `${BASE_URL}/pedido/${pedido.protocolo}?pagamento=ok`,
        pending: `${BASE_URL}/pedido/${pedido.protocolo}`,
        failure: `${BASE_URL}/pedido/${pedido.protocolo}`,
      },
      auto_return: "approved",
      items: [
        {
          id: pedido.protocolo,
          title:
            pedido.quantidade > 1
              ? `${pedido.quantidade} Certidões de Objeto e Pé`
              : "Certidão de Objeto e Pé",
          description: `Protocolo ${pedido.protocolo}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number((pedido.valorCentavos / 100).toFixed(2)),
        },
      ],
    }),
  });

  const texto = await res.text();
  if (!res.ok) {
    console.error(`Mercado Pago /checkout/preferences falhou [${res.status}]: ${texto}`);
    throw new Error(`Mercado Pago respondeu ${res.status}`);
  }
  const pref = JSON.parse(texto) as { id?: string; init_point?: string };
  if (!pref.id || !pref.init_point) {
    throw new Error("Mercado Pago não retornou o link de checkout");
  }
  return { preferenceId: pref.id, checkoutUrl: pref.init_point, expiraEm };
}
