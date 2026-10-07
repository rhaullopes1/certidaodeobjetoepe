/**
 * Regras puras da régua de recuperação (sem acesso a banco), para teste.
 * Cada etapa conta a partir da etapa ANTERIOR, garantindo espaçamento real.
 */
export type EtapaRegua = 1 | 2 | 3;

const MIN = 60 * 1000;
export const ESPERA_MS: Record<EtapaRegua, number> = {
  1: 30 * MIN, // após a criação do pedido
  2: 12 * 60 * MIN, // após o envio da etapa 1
  3: 24 * 60 * MIN, // após o envio da etapa 2
};

export const STATUS_ANTERIOR: Record<EtapaRegua, string> = {
  1: "pendente",
  2: "etapa_1_enviada",
  3: "etapa_2_enviada",
};

type Linha = {
  data_criacao: string;
  status_automacao: string;
  etapa_1_em: string | null;
  etapa_2_em: string | null;
  etapa_3_em: string | null;
};

/** Retorna a etapa a enviar agora, ou null se nada é devido. */
export function etapaDevida(row: Linha, agora = Date.now()): EtapaRegua | null {
  const passou = (iso: string | null, espera: number) =>
    Boolean(iso) && agora - new Date(iso as string).getTime() >= espera;

  if (row.etapa_3_em) return null;
  if (row.status_automacao === "pendente" && !row.etapa_1_em) {
    return passou(row.data_criacao, ESPERA_MS[1]) ? 1 : null;
  }
  if (row.status_automacao === "etapa_1_enviada" && !row.etapa_2_em) {
    return passou(row.etapa_1_em, ESPERA_MS[2]) ? 2 : null;
  }
  if (row.status_automacao === "etapa_2_enviada") {
    return passou(row.etapa_2_em, ESPERA_MS[3]) ? 3 : null;
  }
  return null;
}

/** Status de pedido que encerram a régua. */
export function pedidoEncerrado(p: { status: string; pago_em: string | null }) {
  return Boolean(p.pago_em) || ["pago", "cancelado", "expirado", "em_analise", "protocolado", "emitida", "emitido"].includes(p.status);
}
