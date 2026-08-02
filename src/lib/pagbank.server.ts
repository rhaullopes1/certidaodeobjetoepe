// Integração PagBank (PagSeguro) — cobrança Pix dinâmica com QR Code e webhook.

const API_BASE = "https://api.pagseguro.com";

export const BASE_URL =
  process.env["PUBLIC_SITE_URL"] ?? "https://objeto-e-pe-online.lovable.app";

function token() {
  const t = process.env["PAGBANK_TOKEN"];
  if (!t) throw new Error("PAGBANK_TOKEN não configurado");
  return t;
}

function telefone(whatsapp: string) {
  const d = whatsapp.replace(/\D/g, "").replace(/^55/, "");
  const area = d.slice(0, 2);
  const numero = d.slice(2);
  return { country: "55", area, number: numero, type: "MOBILE" as const };
}

export type CobrancaPix = {
  orderId: string;
  codigo: string;
  qrCodeUrl: string | null;
  expiraEm: string | null;
};

type PagBankOrder = {
  id?: string;
  qr_codes?: Array<{
    id?: string;
    text?: string;
    expiration_date?: string;
    links?: Array<{ rel?: string; href?: string; media?: string }>;
  }>;
  charges?: Array<{ status?: string; paid_at?: string }>;
};

async function pagbank(path: string, init?: RequestInit): Promise<PagBankOrder> {
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
    console.error(`PagBank ${path} falhou [${res.status}]: ${texto}`);
    throw new Error(`PagBank respondeu ${res.status}`);
  }
  return texto ? (JSON.parse(texto) as PagBankOrder) : {};
}

export async function criarCobrancaPix(pedido: {
  protocolo: string;
  nomeCliente?: string;
  email: string;
  cpf: string;
  whatsapp: string;
  valorCentavos: number;
}): Promise<CobrancaPix> {
  const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const order = await pagbank("/orders", {
    method: "POST",
    body: JSON.stringify({
      reference_id: pedido.protocolo,
      customer: {
        name: pedido.nomeCliente || `Cliente ${pedido.protocolo}`,
        email: pedido.email,
        tax_id: pedido.cpf.replace(/\D/g, ""),
        phones: [telefone(pedido.whatsapp)],
      },
      items: [
        {
          reference_id: pedido.protocolo,
          name: "Certidão de Objeto e Pé",
          quantity: 1,
          unit_amount: pedido.valorCentavos,
        },
      ],
      qr_codes: [
        {
          amount: { value: pedido.valorCentavos },
          expiration_date: expiracao,
        },
      ],
      notification_urls: [`${BASE_URL}/api/public/webhooks/pagbank`],
    }),
  });

  const qr = order.qr_codes?.[0];
  if (!order.id || !qr?.text) throw new Error("PagBank não retornou o QR Code Pix");

  const imagem = qr.links?.find((l) => l.rel?.toUpperCase().includes("PNG"))?.href ?? null;

  return {
    orderId: order.id,
    codigo: qr.text,
    qrCodeUrl: imagem,
    expiraEm: qr.expiration_date ?? expiracao,
  };
}

/** Consulta o pedido no PagBank — fonte da verdade sobre o pagamento. */
export async function consultarCobranca(orderId: string) {
  const order = await pagbank(`/orders/${encodeURIComponent(orderId)}`);
  const charge = order.charges?.find((c) => c.status === "PAID") ?? order.charges?.[0];
  return {
    pago: charge?.status === "PAID",
    cancelado: charge?.status === "DECLINED" || charge?.status === "CANCELED",
    pagoEm: charge?.paid_at ?? null,
    referenceId: (order as { reference_id?: string }).reference_id ?? null,
  };
}