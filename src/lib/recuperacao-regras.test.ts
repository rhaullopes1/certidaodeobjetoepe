import { describe, expect, it } from "vitest";
import { etapaDevida, pedidoEncerrado } from "./recuperacao-regras";

const H = 3600 * 1000;
const base = { etapa_1_em: null, etapa_2_em: null, etapa_3_em: null };
const t0 = Date.parse("2026-10-07T12:00:00Z");
const iso = (ms: number) => new Date(ms).toISOString();

describe("etapaDevida", () => {
  it("etapa 1 só após 30 min da criação", () => {
    const r = { ...base, data_criacao: iso(t0), status_automacao: "pendente" };
    expect(etapaDevida(r, t0 + 29 * 60 * 1000)).toBeNull();
    expect(etapaDevida(r, t0 + 30 * 60 * 1000)).toBe(1);
  });
  it("etapa 2 conta 12h a partir da etapa 1, não da criação", () => {
    const r = { ...base, data_criacao: iso(t0 - 100 * H), status_automacao: "etapa_1_enviada", etapa_1_em: iso(t0) };
    expect(etapaDevida(r, t0 + 1 * H)).toBeNull();
    expect(etapaDevida(r, t0 + 12 * H)).toBe(2);
  });
  it("etapa 3 conta 24h a partir da etapa 2", () => {
    const r = { ...base, data_criacao: iso(t0 - 100 * H), status_automacao: "etapa_2_enviada", etapa_1_em: iso(t0 - 50 * H), etapa_2_em: iso(t0) };
    expect(etapaDevida(r, t0 + 23 * H)).toBeNull();
    expect(etapaDevida(r, t0 + 24 * H)).toBe(3);
  });
  it("nada após etapa 3 ou status final", () => {
    expect(etapaDevida({ ...base, data_criacao: iso(0), status_automacao: "etapa_3_enviada", etapa_3_em: iso(0) }, t0)).toBeNull();
    expect(etapaDevida({ ...base, data_criacao: iso(0), status_automacao: "recuperado" }, t0)).toBeNull();
  });
  it("pedido pago encerra", () => {
    expect(pedidoEncerrado({ status: "aguardando_pagamento", pago_em: iso(t0) })).toBe(true);
    expect(pedidoEncerrado({ status: "cancelado", pago_em: null })).toBe(true);
    expect(pedidoEncerrado({ status: "aguardando_pagamento", pago_em: null })).toBe(false);
  });
});
