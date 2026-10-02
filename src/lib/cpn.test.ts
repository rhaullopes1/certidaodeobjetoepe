import { describe, expect, it } from "vitest";
import { analisarNup } from "./cnj";
import { CASOS_DEMO, escolherRota, textoRota, type RotaCertidao } from "./cpn";

const base: RotaCertidao = {
  id: "r1", sistema: "eproc", grau: null, tipo_certidao: "objeto_e_pe", modalidade: "AUTOMATICA", metodo: "AUTO_EPROC",
  url_fonte: "https://x", url_certidao: null, exige_login: true, exige_advogado: true, exige_peticao: null, exige_pagamento: null,
  custo: null, prazo: null, autenticidade_url: null, requisitos: null, observacoes: null, excecoes: null,
  texto_base_solicitacao: null, fonte_evidencia: null, automacao_cpn: "nao_homologada", prioridade: 10, ultima_verificacao: "2026-10-02",
};

describe("motor de rotas CPN", () => {
  it("sem rotas → VERIFICAR", () => {
    expect(escolherRota([], { sistema: "PJe", grau: null, nivelSigilo: 0 }).modalidade).toBe("VERIFICAR");
  });
  it("sistema compatível mantém modalidade cadastrada", () => {
    expect(escolherRota([base], { sistema: "Eproc", grau: "G1", nivelSigilo: 0 }).modalidade).toBe("AUTOMATICA");
  });
  it("sistema divergente não usa a rota", () => {
    expect(escolherRota([base], { sistema: "PJe", grau: null, nivelSigilo: 0 }).rota).toBeNull();
  });
  it("sistema não confirmado rebaixa AUTOMÁTICA para VERIFICAR", () => {
    expect(escolherRota([base], { sistema: null, grau: null, nivelSigilo: null }).modalidade).toBe("VERIFICAR");
  });
  it("segredo de justiça força MANUAL", () => {
    expect(escolherRota([base], { sistema: "eproc", grau: null, nivelSigilo: 2 }).modalidade).toBe("MANUAL");
  });
  it("texto da rota inclui fonte e alerta de não homologação", () => {
    const e = escolherRota([base], { sistema: "eproc", grau: null, nivelSigilo: 0 });
    const t = textoRota({ numero: "1", tribunal: "TJSC", unidade: null }, e);
    expect(t).toContain("https://x");
    expect(t).toContain("não homologada");
  });
  it("casos DEMO têm dígito verificador válido", () => {
    for (const c of CASOS_DEMO) expect(analisarNup(c.numero)?.digitoValido).toBe(true);
  });
});
