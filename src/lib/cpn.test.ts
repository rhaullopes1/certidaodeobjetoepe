import { describe, expect, it } from "vitest";
import { escolherRota, textoRota, type RotaCertidao } from "./cpn";

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
    expect(statusConsulta({ tribunalIdentificado: true, datajudStatus: "indisponivel" })).toBe("fonte_indisponivel");
    expect(statusConsulta({ tribunalIdentificado: true, datajudStatus: "nao_configurado" })).toBe("fonte_indisponivel");
    expect(statusConsulta({ tribunalIdentificado: true, datajudStatus: "ok" })).toBe("confirmado");
    expect(statusConsulta({ tribunalIdentificado: false, datajudStatus: null })).toBe("tribunal_nao_identificado");
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

import { dadosConfirmados, estadoDado, estadoRota } from "./cpn";
import * as cpn from "./cpn";

describe("CPN somente dados reais", () => {
  it("não existe catálogo DEMO exportado para a UI", () => {
    expect((cpn as Record<string, unknown>)["CASOS_DEMO"]).toBeUndefined();
  });
  it("fonte indisponível/não configurada não produz dados (sem fallback)", () => {
    for (const status of ["indisponivel", "nao_configurado", "limite_requisicoes", "nao_encontrado", "tribunal_nao_suportado"]) {
      expect(dadosConfirmados({ status, sistema: "eproc", orgaoJulgador: "X", classe: "Y" })).toEqual({});
      expect(estadoDado(status)).not.toBe("DADO_CONFIRMADO");
    }
  });
  it("só status ok repassa campos; ausência permanece ausência", () => {
    const d = dadosConfirmados({ status: "ok", sistema: "SAJ" });
    expect(d.sistema).toBe("SAJ");
    expect(d.orgaoJulgador).toBeNull();
    expect(d.assuntos).toEqual([]);
    expect(estadoDado("ok")).toBe("DADO_CONFIRMADO");
  });
  it("rota não homologada nunca aparece como homologada; pendente = VERIFICAR", () => {
    const ctx = { sistema: "eproc", grau: null, nivelSigilo: 0 };
    expect(estadoRota(escolherRota([base], ctx))).toBe("VERIFICAR");
    expect(estadoRota(escolherRota([{ ...base, status_verificacao: "verificada" }], ctx))).toBe("ROTA_IDENTIFICADA");
    expect(estadoRota(escolherRota([{ ...base, status_verificacao: "pendente", automacao_cpn: "homologada" }], ctx))).toBe("VERIFICAR");
    expect(estadoRota(escolherRota([{ ...base, status_verificacao: "verificada", automacao_cpn: "homologada" }], ctx))).toBe("ROTA_HOMOLOGADA");
    expect(estadoRota(escolherRota([], ctx))).toBe("VERIFICAR");
  });
});

import { canaisDaRota, passosDaRota, statusRota, textoInstrucoes, textoSolicitacao, TIPOS_ROTA } from "./cpn";
import { analisarNup as nup } from "./cnj";

describe("motor de rotas — catálogo e perfis", () => {
  const ctx = { sistema: "eproc", grau: "G1", nivelSigilo: 0 };
  const parte = { ...base, id: "p", tipo_rota: "AUTO_EPROC", perfil: "parte_advogado_habilitado", prioridade: 10 };
  const terceiro = { ...base, id: "t", tipo_rota: "MANUAL_BALCAO_VIRTUAL", modalidade: "MANUAL", perfil: "terceiro_ou_advogado_nao_cadastrado", prioridade: 20 };
  const sig = { ...base, id: "s", tipo_rota: "MANUAL_BALCAO_VIRTUAL", modalidade: "MANUAL", perfil: "sigiloso", prioridade: 5 };

  it("normaliza CNJ com/sem pontuação e valida DV", () => {
    expect(nup("1502191-61.2023.8.26.0543")?.formatado).toBe("1502191-61.2023.8.26.0543");
    expect(nup("15021916120238260543")?.digitoValido).toBe(true);
    expect(nup("15021916220238260543")?.digitoValido).toBe(false);
    expect(nup("123")).toBeNull();
  });
  it("sem sigilo: rota principal é a de parte; terceiro vira alternativa; sigilosa não é principal", () => {
    const e = escolherRota([parte, terceiro, sig], ctx);
    expect(e.rota?.id).toBe("p");
    expect(e.alternativas?.map((a) => a.id)).toEqual(expect.arrayContaining(["t", "s"]));
  });
  it("com sigilo: rota sigilosa é a principal e MANUAL", () => {
    const e = escolherRota([parte, terceiro, sig], { ...ctx, nivelSigilo: 1 });
    expect(e.rota?.id).toBe("s");
    expect(e.modalidade).toBe("MANUAL");
  });
  it("sistema com alternativas (SAJ/SG ou eproc 2G) casa com qualquer um", () => {
    const r = { ...base, sistema: "SAJ/SG ou eproc 2G" };
    expect(escolherRota([r], { sistema: "SAJ", grau: null, nivelSigilo: 0 }).rota).not.toBeNull();
    expect(escolherRota([r], { sistema: "PJe", grau: null, nivelSigilo: 0 }).rota).toBeNull();
  });
  it("status: pendente = VERIFICAR; verificada mostra a categoria; AUTO_API sem homologação nunca é AUTOMÁTICA", () => {
    expect(statusRota(parte).categoria).toBe("VERIFICAR");
    expect(statusRota({ ...parte, status_verificacao: "verificada" }).categoria).toBe("AUTOMATICA");
    expect(statusRota({ ...terceiro, status_verificacao: "verificada" }).categoria).toBe("MANUAL");
    expect(statusRota({ ...base, tipo_rota: "AUTO_API", status_verificacao: "verificada" }).categoria).toBe("VERIFICAR");
    expect(statusRota({ ...base, tipo_rota: "ASSISTIDA_EPROC", status_verificacao: "verificada" }).categoria).toBe("ASSISTIDA");
    expect(statusRota({ ...base, tipo_rota: "INEXISTENTE" }).declarada).toBe("VERIFICAR");
    expect(statusRota(null).categoria).toBe("VERIFICAR");
    expect(Object.keys(TIPOS_ROTA)).toHaveLength(12);
  });
  it("ausência de dados: canais/passos inválidos são descartados; sem prazo/custo nada é escrito", () => {
    const r = { ...base, passos: ["ok", 3, ""], canais: [{ tipo: "email", rotulo: "E-mail da unidade", valor: null }, { lixo: 1 }] };
    expect(passosDaRota(r)).toEqual(["ok"]);
    expect(canaisDaRota(r)).toEqual([{ tipo: "email", rotulo: "E-mail da unidade", valor: null }]);
    const t = textoInstrucoes({ numero: "1", tribunal: "TJSP" }, r);
    expect(t).not.toContain("Prazo");
    expect(t).not.toContain("Custo");
    expect(t).toContain("endereço específico não cadastrado");
    expect(textoInstrucoes({ numero: "1", tribunal: "TJXX" }, null)).toContain("VERIFICAR");
  });
  it("texto de solicitação se adapta ao perfil", () => {
    expect(textoSolicitacao({ numero: "1", unidade: null, tribunal: "TJSP" }, terceiro)).toContain("terceiro interessado");
    expect(textoSolicitacao({ numero: "1", unidade: null, tribunal: "TJSP" }, sig)).toContain("despacho");
  });
});

describe("catálogo TJBA / TJPR", () => {
  const r = (o: Partial<RotaCertidao>): RotaCertidao => ({ ...base, sistema: null, automacao_cpn: "nao_homologada", status_verificacao: "pendente", ultima_verificacao: null, ...o });
  const tjba = [
    r({ id: "ba-p", grau: "G1", tipo_rota: "MANUAL_EMAIL", modalidade: "MANUAL", perfil: "parte_advogado_habilitado", prioridade: 10, canais: [{ tipo: "email", rotulo: "E-mail da unidade judicial", valor: null }] }),
    r({ id: "ba-t", grau: "G1", tipo_rota: "MANUAL_EMAIL", modalidade: "MANUAL", perfil: "terceiro_ou_advogado_nao_cadastrado", prioridade: 20 }),
    r({ id: "ba-s", grau: "G1", tipo_rota: "MANUAL_EMAIL", modalidade: "MANUAL", perfil: "sigiloso", prioridade: 5 }),
  ];
  const tjpr = [
    r({ id: "pr-2", grau: "G2", tipo_rota: "MANUAL_FORMULARIO", modalidade: "MANUAL", perfil: "qualquer", prioridade: 10 }),
    r({ id: "pr-1", grau: "G1", tipo_rota: "VERIFICAR", modalidade: "VERIFICAR", perfil: "qualquer", prioridade: 50 }),
  ];
  it("TJBA: rota de parte é selecionável; terceiro e sigiloso como alternativas; sigilo escolhe a sigilosa", () => {
    const e = escolherRota(tjba, { sistema: "PJe", grau: "G1", nivelSigilo: 0 });
    expect(e.rota?.id).toBe("ba-p");
    expect(e.alternativas?.map((a) => a.id)).toEqual(expect.arrayContaining(["ba-t", "ba-s"]));
    expect(escolherRota(tjba, { sistema: "PJe", grau: "G1", nivelSigilo: 1 }).rota?.id).toBe("ba-s");
  });
  it("TJBA: e-mail da unidade sem endereço permanece vazio (não inventado)", () => {
    expect(canaisDaRota(tjba[0])[0].valor).toBeNull();
  });
  it("TJPR: grau escolhe a rota certa; grau desconhecido gera alerta", () => {
    expect(escolherRota(tjpr, { sistema: null, grau: "G2", nivelSigilo: 0 }).rota?.id).toBe("pr-2");
    expect(escolherRota(tjpr, { sistema: null, grau: "G1", nivelSigilo: 0 }).rota?.id).toBe("pr-1");
    expect(escolherRota(tjpr, { sistema: null, grau: null, nivelSigilo: 0 }).alertas.join()).toContain("grau do processo não foi confirmado");
  });
  it("todas as rotas novas ficam VERIFICAR enquanto pendentes; nenhuma vira automática", () => {
    for (const x of [...tjba, ...tjpr]) {
      expect(statusRota(x).categoria).toBe("VERIFICAR");
      expect(statusRota(x).declarada).not.toBe("AUTOMATICA");
    }
    expect(statusRota({ ...tjba[0], status_verificacao: "verificada" }).categoria).toBe("MANUAL");
    expect(statusRota({ ...tjpr[1], status_verificacao: "verificada" }).categoria).toBe("VERIFICAR");
  });
});
