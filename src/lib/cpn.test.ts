import { describe, expect, it } from "vitest";
import { escolherRota, textoRota, type RotaCertidao } from "./cpn";

const base: RotaCertidao = {
  id: "r1", sistema: "eproc", grau: null, tipo_certidao: "objeto_e_pe", modalidade: "AUTOMATICA", metodo: "AUTO_EPROC",
  url_fonte: "https://x", url_certidao: null, exige_login: true, exige_advogado: true, exige_peticao: null, exige_pagamento: null,
  custo: null, prazo: null, autenticidade_url: null, requisitos: null, observacoes: null, excecoes: null,
  texto_base_solicitacao: null, fonte_evidencia: null, fonte_trecho: "trecho oficial", automacao_cpn: "nao_homologada", prioridade: 10, ultima_verificacao: "2026-10-02",
};

describe("motor de rotas CPN", () => {
  it("sem rotas → VERIFICAR", () => {
    expect(escolherRota([], { sistema: "PJe", grau: null, nivelSigilo: 0 }).modalidade).toBe("VERIFICAR");
  });
  it("sistema compatível mantém modalidade cadastrada só se verificada com evidência", () => {
    expect(escolherRota([{ ...base, status_verificacao: "verificada" }], { sistema: "Eproc", grau: "G1", nivelSigilo: 0 }).modalidade).toBe("AUTOMATICA");
    expect(escolherRota([base], { sistema: "Eproc", grau: "G1", nivelSigilo: 0 }).modalidade).toBe("VERIFICAR");
  });
  it("sistema divergente não usa a rota", () => {
    expect(escolherRota([base], { sistema: "PJe", grau: null, nivelSigilo: 0 }).rota).toBeNull();
  });
  it("sistema não confirmado rebaixa AUTOMÁTICA para VERIFICAR", () => {
    expect(escolherRota([base], { sistema: null, grau: null, nivelSigilo: null }).modalidade).toBe("VERIFICAR");
  });
  it("segredo de justiça força MANUAL", () => {
    expect(escolherRota([{ ...base, status_verificacao: "verificada" }], { sistema: "eproc", grau: null, nivelSigilo: 2 }).modalidade).toBe("MANUAL");
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

});

describe("Homologação controlada de rotas", () => {
  const rota: RotaHomologavel = {
    id: "r1", tribunal_id: "t1", sistema: "eproc", grau: "1º grau", perfil: "qualquer", tipo_rota: "MANUAL_EMAIL",
    url_fonte: null, url_certidao: null, autenticidade_url: null, fonte_evidencia: null, fonte_trecho: null,
    requisitos: "Petição", quem_pode: null, passos: ["a"], canais: ["Unidade"], status_verificacao: "pendente", automacao_cpn: "nao_homologada",
  };
  const ev: EvidenciaInformada = { urlFonte: "https://www.tribunal.jus.br/certidoes", trecho: "A certidão de objeto e pé é emitida pela secretaria da vara.", dataVerificacao: "2026-10-02", observacao: null };
  const base = { confirmado: true, admin: true, userId: "u1", hoje: "2026-10-02" };

  it("bloqueia homologação sem evidência", () => {
    const vazio = { urlFonte: null, trecho: null, dataVerificacao: null, observacao: null };
    expect(requisitosHomologacao(rota, vazio, base.hoje).length).toBeGreaterThanOrEqual(3);
    expect(() => prepararHomologacao(rota, vazio, base)).toThrow(/Homologação bloqueada/);
    expect(() => prepararHomologacao(rota, { ...ev, trecho: "curto" }, base)).toThrow(/trecho/);
    expect(() => prepararHomologacao(rota, { ...ev, urlFonte: "http://x" }, base)).toThrow(/URL/);
    expect(() => prepararHomologacao(rota, { ...ev, dataVerificacao: "2026-12-01" }, base)).toThrow(/futura/);
    expect(() => prepararHomologacao({ ...rota, tipo_rota: "VERIFICAR" }, ev, base)).toThrow(/tipo de rota/);
    expect(() => prepararHomologacao({ ...rota, passos: [] }, ev, base)).toThrow(/passo/);
    expect(() => prepararHomologacao(rota, ev, { ...base, admin: false })).toThrow(/administradores/);
    expect(() => prepararHomologacao(rota, ev, { ...base, confirmado: false })).toThrow(/Confirmação/);
  });

  it("permite homologação com evidência mínima, sem tocar automação", () => {
    const { patch, auditoria } = prepararHomologacao(rota, ev, base);
    expect(patch).toMatchObject({ status_verificacao: "verificada", url_fonte: ev.urlFonte, fonte_trecho: ev.trecho, ultima_verificacao: "2026-10-02", verificado_por: "u1", responsavel_id: "u1" });
    expect(patch).not.toHaveProperty("automacao_cpn");
    expect(patch).not.toHaveProperty("modalidade");
    expect(patch).not.toHaveProperty("tipo_rota");
    expect(auditoria).toMatchObject({ acao: "homologar_rota", route_id: "r1", operador_id: "u1", resultado: "verificada", detalhes: { status_anterior: "pendente", automacao_cpn: "nao_homologada", confirmado: true } });
  });

  it("manter VERIFICAR nunca marca verificada e rebaixa rota já homologada", () => {
    const m = prepararManterVerificar(rota, { ...ev, trecho: null }, base);
    expect(m.patch?.status_verificacao).toBe("pendente");
    expect(m.faltando.join()).toContain("trecho");
    const m2 = prepararManterVerificar({ ...rota, status_verificacao: "verificada" }, ev, base);
    expect(m2.patch?.status_verificacao).toBe("revisar");
  });

  it("registra auditoria em todas as ações; operador só audita", () => {
    const m = prepararManterVerificar(rota, ev, { ...base, admin: false });
    expect(m.patch).toBeNull();
    expect(m.auditoria).toMatchObject({ acao: "solicitar_revisao_rota", route_id: "r1", operador_id: "u1" });
    const a = prepararManterVerificar(rota, ev, base).auditoria;
    expect(a).toMatchObject({ acao: "manter_verificar_rota", detalhes: { url_fonte_consultada: ev.urlFonte, data_verificacao: "2026-10-02" } });
    expect(lacunasRota(rota)).toEqual(expect.arrayContaining(["URL da fonte oficial cadastrada", "trecho da fonte oficial cadastrado"]));
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
    expect(e.modalidade).toBe("VERIFICAR"); // pendente de verificação
    expect(escolherRota([parte, terceiro, { ...sig, status_verificacao: "verificada" }], { ...ctx, nivelSigilo: 1 }).modalidade).toBe("MANUAL");
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

import { avaliarRota, canonGrau, canonSistema } from "./cpn";

describe("matching explicável e incompatibilidades", () => {
  const v = (o: Partial<RotaCertidao>): RotaCertidao => ({ ...base, status_verificacao: "verificada", ...o });
  it("normaliza sistema por família, sem substring solta", () => {
    expect(canonSistema("e-SAJ")).toBe("saj");
    expect(canonSistema("PJe 2G")).toBe("pje");
    expect(canonSistema("eproc 2G")).toBe("eproc");
    expect(escolherRota([v({ sistema: "SAJ/SG ou eproc 2G" })], { sistema: "SG", grau: null, nivelSigilo: 0 }).rota).not.toBeNull();
    expect(escolherRota([v({ sistema: "SG" })], { sistema: "SGX", grau: null, nivelSigilo: 0 }).rota).toBeNull();
  });
  it("normaliza grau", () => {
    expect(canonGrau("1")).toBe("G1");
    expect(canonGrau("G2")).toBe("G2");
    expect(canonGrau("JE")).toBe("JE");
  });
  it("rota G1 diante de Juizado Especial é indeterminada (falta evidência), não aplicável nem descartada", () => {
    const a = avaliarRota(v({ sistema: null, grau: "G1" }), { sistema: null, grau: "JE", nivelSigilo: 0 }, false);
    expect(a.aplicavel).toBe("indeterminado");
    expect(a.faltando.join()).toContain("Juizado Especial");
    expect(escolherRota([v({ sistema: null, grau: "G1" })], { sistema: null, grau: "JE", nivelSigilo: 0 }).modalidade).toBe("VERIFICAR");
  });
  it("sistema incompatível → não aplicável com motivo", () => {
    const a = avaliarRota(v({ sistema: "eproc" }), { sistema: "SAJ", grau: "G1", nivelSigilo: 0 }, false);
    expect(a.aplicavel).toBe("nao");
    expect(a.motivos.join()).toContain("incompatível");
  });
  it("perfil não informado → indeterminado e alerta de decisão; perfil informado decide", () => {
    const p = v({ id: "p", perfil: "parte_advogado_habilitado", prioridade: 10 });
    const t = v({ id: "t", perfil: "terceiro_ou_advogado_nao_cadastrado", modalidade: "MANUAL", prioridade: 20 });
    const ctx = { sistema: "eproc", grau: "G1", nivelSigilo: 0 };
    const e = escolherRota([p, t], ctx);
    expect(e.modalidade).toBe("VERIFICAR");
    expect(e.alertas.join()).toContain("Perfil do solicitante não informado");
    expect(e.avaliacoes?.find((a) => a.rotaId === "p")?.faltando.join()).toContain("perfil do solicitante");
    const t2 = escolherRota([p, t], { ...ctx, perfil: "terceiro_ou_advogado_nao_cadastrado" });
    expect(t2.rota?.id).toBe("t");
    expect(t2.modalidade).toBe("MANUAL");
    expect(t2.avaliacoes?.find((a) => a.rotaId === "p")?.aplicavel).toBe("nao");
  });
  it("sigilo desconhecido com rota sigilosa no catálogo → sigilosa indeterminada e alerta", () => {
    const s = v({ id: "s", perfil: "sigiloso", modalidade: "MANUAL" });
    const e = escolherRota([v({ id: "q" }), s], { sistema: "eproc", grau: null, nivelSigilo: null });
    expect(e.avaliacoes?.find((a) => a.rotaId === "s")?.aplicavel).toBe("indeterminado");
    expect(e.alertas.join()).toContain("Nível de sigilo não informado");
  });
  it("rota sem evidência (sem URL/trecho) nunca sai de VERIFICAR, mesmo verificada", () => {
    const e = escolherRota([v({ url_fonte: null, fonte_trecho: null })], { sistema: "eproc", grau: null, nivelSigilo: 0 });
    expect(e.modalidade).toBe("VERIFICAR");
    expect(e.alertas.join()).toContain("Evidência insuficiente");
  });
  it("pendente com tudo compatível continua VERIFICAR", () => {
    expect(escolherRota([base], { sistema: "eproc", grau: null, nivelSigilo: 0 }).modalidade).toBe("VERIFICAR");
  });
  it("nenhuma aplicável → rota nula, VERIFICAR, com avaliações explicando", () => {
    const e = escolherRota([v({ sistema: "PJe" })], { sistema: "eproc", grau: null, nivelSigilo: 0 });
    expect(e.rota).toBeNull();
    expect(e.avaliacoes?.[0].aplicavel).toBe("nao");
  });
});
