/**
 * Score de intenção de compra (0–100) para pedidos NÃO pagos.
 * Usa só sinais já registrados no pedido — sem IA, sem inferência externa.
 * Quanto maior, mais "quente": priorize o contato.
 */
export type SinaisPedido = {
  created_at: string;
  quantidade: number;
  finalidade: string | null;
  whatsappValido: boolean;
  /** Cliente reabriu o link do pedido depois de cancelado/expirado. */
  reativado_em: string | null;
  /** Status do pagamento no Mercado Pago (pending = Pix gerado, rejected = cartão recusado). */
  mercadopago_status: string | null;
  oferta_expira_em: string | null;
};

const URGENTES = new Set(["caminhoneiro_motorista", "motorista_app", "concurso_publico"]);
const H = 3600 * 1000;

export type Faixa = "quente" | "morno" | "frio";

export function scoreIntencao(p: SinaisPedido, agora = Date.now()) {
  const motivos: string[] = [];
  let s = 0;
  const idadeH = (agora - new Date(p.created_at).getTime()) / H;

  if (idadeH < 2) { s += 30; motivos.push("pedido recente (<2h)"); }
  else if (idadeH < 24) { s += 20; motivos.push("pedido de hoje (<24h)"); }
  else if (idadeH < 72) { s += 10; motivos.push("pedido com até 3 dias"); }

  if (p.mercadopago_status === "rejected") { s += 20; motivos.push("tentou pagar no cartão (recusado)"); }
  else if (p.mercadopago_status === "pending") { s += 15; motivos.push("gerou o Pix"); }

  if (p.reativado_em) { s += 20; motivos.push("reabriu o link do pedido"); }
  if (p.finalidade && URGENTES.has(p.finalidade)) { s += 15; motivos.push("finalidade urgente"); }
  if (p.quantidade > 1) { s += 5; motivos.push(`${p.quantidade} certidões`); }
  if (p.whatsappValido) { s += 5; } else { motivos.push("sem WhatsApp válido"); }
  if (p.oferta_expira_em && new Date(p.oferta_expira_em).getTime() > agora) { s += 5; motivos.push("oferta ativa"); }

  const score = Math.min(100, s);
  const faixa: Faixa = score >= 55 ? "quente" : score >= 30 ? "morno" : "frio";
  return { score, faixa, motivos };
}
