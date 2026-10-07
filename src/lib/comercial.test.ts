import { describe, expect, it } from "vitest";
import { funilDiario, metricasPorEtapa, ultimosDias } from "./comercial";
import { scoreIntencao } from "./score-intencao";

const agora = Date.parse("2026-10-07T15:00:00Z"); // 12h em Brasília
const iso = (ms: number) => new Date(ms).toISOString();
const H = 3600 * 1000;

describe("scoreIntencao", () => {
  const base = { quantidade: 1, finalidade: null, whatsappValido: true, reativado_em: null, mercadopago_status: null, oferta_expira_em: null };
  it("pedido recente com Pix gerado e finalidade urgente é quente", () => {
    const r = scoreIntencao({ ...base, created_at: iso(agora - H), mercadopago_status: "pending", finalidade: "caminhoneiro_motorista" }, agora);
    expect(r.score).toBe(55);
    expect(r.faixa).toBe("quente");
  });
  it("pedido antigo sem sinais é frio", () => {
    const r = scoreIntencao({ ...base, created_at: iso(agora - 10 * 24 * H) }, agora);
    expect(r.faixa).toBe("frio");
  });
  it("cartão recusado pesa mais que Pix gerado", () => {
    const a = scoreIntencao({ ...base, created_at: iso(agora - 30 * H), mercadopago_status: "rejected" }, agora);
    const b = scoreIntencao({ ...base, created_at: iso(agora - 30 * H), mercadopago_status: "pending" }, agora);
    expect(a.score).toBeGreaterThan(b.score);
  });
  it("score nunca passa de 100 e oferta vencida não conta", () => {
    const r = scoreIntencao({ ...base, created_at: iso(agora), mercadopago_status: "rejected", reativado_em: iso(agora), finalidade: "motorista_app", quantidade: 3, oferta_expira_em: iso(agora - H) }, agora);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.motivos).not.toContain("oferta ativa");
  });
});

describe("funilDiario", () => {
  it("separa criados, pagamento iniciado e pagos por dia de Brasília", () => {
    const dias = ultimosDias(2, agora);
    const r = funilDiario(
      [
        { created_at: iso(agora - H), pago_em: null, status: "aguardando_pagamento", valor_centavos: 24700, mercadopago_status: "pending" },
        { created_at: iso(agora - 2 * H), pago_em: iso(agora - H), status: "pago", valor_centavos: 24700, mercadopago_status: "approved" },
        { created_at: iso(agora - 3 * H), pago_em: null, status: "aguardando_pagamento", valor_centavos: 24700, mercadopago_status: null },
      ],
      dias,
    );
    const hoje = r[1];
    expect(hoje).toMatchObject({ criados: 3, pagamentoIniciado: 2, pagos: 1, receita: 24700 });
  });
});

describe("metricasPorEtapa", () => {
  it("conta recuperados por etapa e valor recuperado", () => {
    const m = metricasPorEtapa([
      { status_automacao: "recuperado", etapa_1_em: iso(agora), etapa_2_em: null, etapa_3_em: null, valor_total_centavos: 24700, valor_recuperado_centavos: 24700 },
      { status_automacao: "etapa_2_enviada", etapa_1_em: iso(agora), etapa_2_em: iso(agora), etapa_3_em: null, valor_total_centavos: 39700, valor_recuperado_centavos: 0 },
      { status_automacao: "cancelado", etapa_1_em: null, etapa_2_em: null, etapa_3_em: null, valor_total_centavos: 24700, valor_recuperado_centavos: 0 },
    ]);
    expect(m.etapas[1].recuperados).toBe(1);
    expect(m.etapas[2].emAndamento).toBe(1);
    expect(m.valorRecuperado).toBe(24700);
    expect(m.valorEmRecuperacao).toBe(39700);
    expect(m.taxaRecuperacao).toBe(33.3);
  });
});
