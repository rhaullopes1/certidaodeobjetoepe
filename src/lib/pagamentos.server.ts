// Configuração server-side dos meios de pagamento.
//
// COMO ATIVAR O PIX AUTOMÁTICO DO MERCADO PAGO (etapa futura):
//   1. Confirme que o segredo MERCADOPAGO_ACCESS_TOKEN está configurado no projeto.
//   2. Adicione o segredo MERCADOPAGO_PIX_ENABLED com o valor "true".
//   3. Cadastre a URL de notificação no painel do Mercado Pago:
//      https://certidaodeobjetoepe.org/api/public/webhooks/mercadopago
//   4. Faça um pedido de teste e confira o status "pago" automático.
// Sem a flag (padrão), o site continua com o Pix fixo (confirmação manual)
// e o cartão via Stripe — exatamente o comportamento atual em produção.
//
// O token NUNCA pode ir para o browser: estes helpers são server-only.

export type ProvedorPix = "mercadopago" | "pagbank" | null;

/** Flag de ativação do Pix dinâmico do Mercado Pago. Default: desativado. */
export function mercadoPagoPixHabilitado(): boolean {
  const flag = (process.env["MERCADOPAGO_PIX_ENABLED"] ?? "").trim().toLowerCase();
  const ativo = flag === "true" || flag === "1";
  return ativo && Boolean(process.env["MERCADOPAGO_ACCESS_TOKEN"]);
}

export function provedorAtivo(): ProvedorPix {
  if (mercadoPagoPixHabilitado()) return "mercadopago";
  if (process.env["PAGBANK_TOKEN"]) return "pagbank";
  return null;
}

export async function gateway(provedor: Exclude<ProvedorPix, null>) {
  if (provedor === "mercadopago") return await import("./mercadopago.server");
  return await import("./pagbank.server");
}
