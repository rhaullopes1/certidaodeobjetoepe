/**
 * Agregações puras do Centro de Comando Comercial (sem banco), testáveis.
 * Datas no horário de Brasília. Valores em centavos.
 */
export const TZ = "America/Sao_Paulo";
export const diaSP = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });

export type PedidoBase = {
  created_at: string;
  pago_em: string | null;
  status: string;
  valor_centavos: number;
  mercadopago_status: string | null;
};

export type RecuperacaoBase = {
  status_automacao: string;
  etapa_1_em: string | null;
  etapa_2_em: string | null;
  etapa_3_em: string | null;
  valor_total_centavos: number;
  valor_recuperado_centavos: number;
};

export type Dia = {
  dia: string;
  criados: number;
  pagamentoIniciado: number;
  pagos: number;
  receita: number;
};

/** Funil diário: pedido criado → pagamento iniciado (Pix gerado/cartão tentado) → pago. */
export function funilDiario(pedidos: PedidoBase[], dias: string[]): Dia[] {
  const mapa = new Map<string, Dia>(dias.map((d) => [d, { dia: d, criados: 0, pagamentoIniciado: 0, pagos: 0, receita: 0 }]));
  for (const p of pedidos) {
    const c = mapa.get(diaSP(p.created_at));
    if (c) {
      c.criados++;
      if (p.pago_em || p.mercadopago_status) c.pagamentoIniciado++;
    }
    if (p.pago_em) {
      const d = mapa.get(diaSP(p.pago_em));
      if (d) { d.pagos++; d.receita += p.valor_centavos; }
    }
  }
  return dias.map((d) => mapa.get(d)!);
}

/** Últimos N dias (YYYY-MM-DD, Brasília), do mais antigo ao mais recente. */
export function ultimosDias(n: number, agora = Date.now()) {
  return Array.from({ length: n }, (_, i) => diaSP(new Date(agora - (n - 1 - i) * 86400000).toISOString()));
}

export function etapaDe(r: RecuperacaoBase) {
  return r.etapa_3_em ? 3 : r.etapa_2_em ? 2 : r.etapa_1_em ? 1 : 0;
}

const ATIVOS = ["pendente", "etapa_1_enviada", "etapa_2_enviada", "etapa_3_enviada"];

/** Métricas por etapa alcançada e por resultado (em andamento / recuperado / encerrado). */
export function metricasPorEtapa(linhas: RecuperacaoBase[]) {
  const etapas = [0, 1, 2, 3].map((etapa) => ({ etapa, emAndamento: 0, recuperados: 0, encerrados: 0, valorRecuperado: 0, valorEmAberto: 0 }));
  for (const r of linhas) {
    const e = etapas[etapaDe(r)];
    if (r.status_automacao === "recuperado") {
      e.recuperados++;
      e.valorRecuperado += r.valor_recuperado_centavos || r.valor_total_centavos;
    } else if (ATIVOS.includes(r.status_automacao)) {
      e.emAndamento++;
      e.valorEmAberto += r.valor_total_centavos;
    } else {
      e.encerrados++;
    }
  }
  const recuperados = etapas.reduce((s, e) => s + e.recuperados, 0);
  const emAndamento = etapas.reduce((s, e) => s + e.emAndamento, 0);
  const encerrados = etapas.reduce((s, e) => s + e.encerrados, 0);
  const base = recuperados + emAndamento + encerrados;
  return {
    etapas,
    recuperados,
    emAndamento,
    encerrados,
    valorRecuperado: etapas.reduce((s, e) => s + e.valorRecuperado, 0),
    valorEmRecuperacao: etapas.reduce((s, e) => s + e.valorEmAberto, 0),
    taxaRecuperacao: base ? Math.round((recuperados / base) * 1000) / 10 : 0,
  };
}
