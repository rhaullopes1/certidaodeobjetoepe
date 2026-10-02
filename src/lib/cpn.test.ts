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

import { calcularCobertura, filtrarCobertura, prepararMarcacaoRota, statusConsulta } from "./cpn";

describe("CPN fase 2", () => {
  const tribs = [
    { id: "t1", sigla: "TJSC", nome: "Tribunal de Justiça de Santa Catarina", uf: "SC", segmento: 8 },
    { id: "t2", sigla: "TJBA", nome: "Tribunal de Justiça da Bahia", uf: "BA", segmento: 8 },
    { id: "t3", sigla: "TRT22", nome: "TRT 22ª Região", uf: "PI", segmento: 5 },
  ];
  const rotas = [
    { id: "r1", tribunal_id: "t1", modalidade: "AUTOMATICA", status_verificacao: "pendente" },
    { id: "r2", tribunal_id: "t1", modalidade: "MANUAL", status_verificacao: "verificada" },
    { id: "r3", tribunal_id: "t3", modalidade: "SEMIAUTOMATICA", status_verificacao: "pendente" },
  ];

  it("tribunal sem rota → VERIFICAR, sem criar registros fictícios", () => {
    const c = calcularCobertura(tribs, rotas);
    const ba = c.linhas.find((l) => l.sigla === "TJBA")!;
    expect(ba.modalidade).toBe("VERIFICAR");
    expect(ba.temRota).toBe(false);
    expect(ba.totalRotas).toBe(0);
    expect(c.resumo).toMatchObject({ total: 3, comRota: 2, verificar: 1, automatica: 1, semiautomatica: 1, manual: 0 });
    expect(rotas).toHaveLength(3);
  });

  it("cobertura sem tribunais/rotas não inventa nada", () => {
    expect(calcularCobertura([], []).resumo.total).toBe(0);
    expect(calcularCobertura(tribs, []).resumo.comRota).toBe(0);
  });

  it("busca por sigla, nome e UF", () => {
    const { linhas } = calcularCobertura(tribs, rotas);
    expect(filtrarCobertura(linhas, "bahia").map((l) => l.sigla)).toEqual(["TJBA"]);
    expect(filtrarCobertura(linhas, "pi").map((l) => l.sigla)).toEqual(["TRT22"]);
  });

  it("DataJud indisponível → resultado parcial, nunca localizado", () => {
    expect(statusConsulta({ tribunalIdentificado: true, demo: false, datajudStatus: "indisponivel" })).toBe("erro");
    expect(statusConsulta({ tribunalIdentificado: true, demo: false, datajudStatus: "nao_configurado" })).toBe("nao_localizado");
    expect(statusConsulta({ tribunalIdentificado: true, demo: false, datajudStatus: "ok" })).toBe("localizado");
    expect(statusConsulta({ tribunalIdentificado: false, demo: false, datajudStatus: null })).toBe("tribunal_nao_identificado");
    // sem sistema confirmado, rota automática não é afirmada
    expect(escolherRota([base], { sistema: null, grau: null, nivelSigilo: null }).modalidade).not.toBe("AUTOMATICA");
  });

  it("rota homologada não gera alerta de não homologação; não homologada gera", () => {
    const ctx = { sistema: "eproc", grau: null, nivelSigilo: 0 };
    expect(escolherRota([{ ...base, automacao_cpn: "homologada" }], ctx).alertas.join()).not.toContain("não homologada");
    expect(escolherRota([base], ctx).alertas.join()).toContain("não homologada");
  });

  it("marcação de rota exige confirmação, admin e evidência; gera auditoria", () => {
    const p = { acao: "verificada" as const, confirmado: true, admin: true, userId: "u1", routeId: "r1", observacao: "ok", evidenciaAtual: "Portaria X", urlFonte: "https://x", hoje: "2026-10-02" };
    const { patch, auditoria } = prepararMarcacaoRota(p);
    expect(patch).toMatchObject({ status_verificacao: "verificada", ultima_verificacao: "2026-10-02", verificado_por: "u1", responsavel_id: "u1" });
    expect(auditoria).toMatchObject({ acao: "verificar_rota", route_id: "r1", operador_id: "u1", detalhes: { evidencia: "Portaria X", confirmado: true } });
    expect(() => prepararMarcacaoRota({ ...p, confirmado: false })).toThrow();
    expect(() => prepararMarcacaoRota({ ...p, admin: false })).toThrow();
    expect(() => prepararMarcacaoRota({ ...p, evidenciaAtual: null, urlFonte: null })).toThrow();
    const rev = prepararMarcacaoRota({ ...p, acao: "revisar", evidenciaAtual: null, urlFonte: null });
    expect(rev.patch).not.toHaveProperty("ultima_verificacao");
    expect(rev.auditoria.acao).toBe("revisar_rota");
  });
});
