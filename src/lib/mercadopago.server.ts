// Integração Mercado Pago — cobrança Pix dinâmica com QR Code e webhook.

const API_BASE = "https://api.mercadopago.com";

export const BASE_URL =
  process.env["PUBLIC_SITE_URL"] ?? "https://certidaodeobjetoepe.lovable.app";

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
