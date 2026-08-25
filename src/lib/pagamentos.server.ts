// Seleciona o provedor Pix ativo. Mercado Pago tem prioridade; PagBank fica como alternativa.

export type ProvedorPix = "mercadopago" | "pagbank" | null;

export function provedorAtivo(): ProvedorPix {
  if (process.env["MERCADOPAGO_ACCESS_TOKEN"]) return "mercadopago";
  if (process.env["PAGBANK_TOKEN"]) return "pagbank";
  return null;
}

export async function gateway(provedor: Exclude<ProvedorPix, null>) {
  if (provedor === "mercadopago") return await import("./mercadopago.server");
  return await import("./pagbank.server");
}
