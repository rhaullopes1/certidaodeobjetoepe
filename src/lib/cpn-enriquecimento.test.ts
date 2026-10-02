import { describe, expect, it } from "vitest";
import { instrucoesEncaminhamento, montarEnriquecimento, type TribunalEnriq, type UnidadeEnriq } from "./cpn-enriquecimento";
import { escolherRota, statusRota, type RotaCertidao } from "./cpn";

const T: TribunalEnriq = {
  sigla: "TJSP", nome: "Tribunal de Justiça de São Paulo", uf: "SP",
  consulta_processual_url: "https://esaj.tjsp.jus.br/cpopg/open.do", consulta_processual_fonte: "Site oficial", consulta_processual_verificada_em: "2026-09-28",
  balcao_virtual_url: "https://www.tjsp.jus.br/balcao", balcao_virtual_fonte: "Site oficial", balcao_virtual_verificada_em: "2026-09-28",
  certidoes_url: "https://www.tjsp.jus.br/certidoes", certidoes_tipo: "geral", certidoes_email: null, certidoes_telefone: null,
  certidoes_instrucoes: null, certidoes_fonte: "Site oficial", certidoes_verificada_em: "2026-09-28",
};
const SEM_URL: TribunalEnriq = { ...T, consulta_processual_url: null, balcao_virtual_url: null, certidoes_url: null };
const U = (o: Partial<UnidadeEnriq>): UnidadeEnriq => ({
  id: "u1", tribunal: "TJSP", comarca: "Campinas", foro: null, codigo_origem_cnj: "0114", vara_cartorio: null, unidade_judiciaria: "Cartório Cível",
  balcao_virtual_url: null, canal_solicitacao_tipo: null, canal_solicitacao_url: null, canal_solicitacao_email: "civel@tjsp.jus.br",
  canal_solicitacao_telefone: "(19) 3000-0000", instrucoes_solicitacao: null, documentos_exigidos: null, taxa_info: null, prazo_info: null,
  fonte_url: "https://www.tjsp.jus.br/x", fonte_tipo: "Site oficial do tribunal", fonte_atualizada_em: "2026-09-28",
  endereco: "Rua A, 1", cep: "13000-000", responsavel_nome: null, responsavel_setor: "Cartório", telefone: null, email: null, ativo: true, ...o,
});
const base = { segmento: "Justiça Estadual", codigoOrigem: "0114", comarcaCnj: { nome: "Campinas", cidade: "Campinas", uf: "SP", foro: null }, vara: null };

describe("enriquecimento CPN", () => {
  it("comarca + unidade + contato existentes → canal específico da unidade", () => {
    const en = montarEnriquecimento({ ...base, tribunal: T, unidades: [U({})] });
    expect(en.unidade?.nivel).toBe("codigo_origem");
    expect(en.canal.status).toBe("confirmado");
    expect(en.canal.email).toBe("civel@tjsp.jus.br");
    expect(en.campos.find((c) => c.rotulo === "Endereço")?.valor).toContain("CEP 13000-000");
    expect(instrucoesEncaminhamento(en)[0]).toMatch(/^Solicitar na unidade/);
  });
  it("tribunal sem contato específico → canal geral, explicitamente não específico", () => {
    const en = montarEnriquecimento({ ...base, tribunal: T, unidades: [] });
    expect(en.unidade).toBeNull();
    expect(en.canal.status).toBe("canal_tribunal");
    expect(en.canal.fallback).toBe(true);
    expect(instrucoesEncaminhamento(en)[0]).toContain("confirmar se atende esta certidão/unidade");
  });
  it("URLs gerais aparecem como contexto com fonte e data", () => {
    const en = montarEnriquecimento({ ...base, tribunal: T, unidades: [] });
    expect(en.canaisGerais.map((g) => g.rotulo)).toHaveLength(3);
    expect(en.canaisGerais.every((g) => g.fonte && g.verificadaEm)).toBe(true);
  });
  it("sem comarca nem contato nem URLs → não identificado, nada inventado", () => {
    const en = montarEnriquecimento({ ...base, comarcaCnj: null, tribunal: SEM_URL, unidades: [] });
    expect(en.canal.status).toBe("nao_cadastrado");
    expect(en.canal).toMatchObject({ email: null, telefone: null, url: null });
    expect(en.campos.some((c) => c.rotulo === "Comarca")).toBe(false);
    expect(instrucoesEncaminhamento(en)[0]).toMatch(/não identificado/);
  });
  it("sem tribunal → nada", () => {
    const en = montarEnriquecimento({ ...base, tribunal: null, unidades: [U({})] });
    expect(en.unidade).toBeNull();
    expect(en.canaisGerais).toEqual([]);
  });
  it("canal geral não vira rota específica; rota pendente segue VERIFICAR", () => {
    const en = montarEnriquecimento({ ...base, tribunal: T, unidades: [] });
    const semRota = escolherRota([], { sistema: null, grau: null, nivelSigilo: 0 });
    expect(semRota.rota).toBeNull();
    expect(statusRota(semRota.rota).categoria).toBe("VERIFICAR");
    expect(en.canaisGerais.length).toBeGreaterThan(0);
    const pend = { id: "r", tipo_rota: "AUTO_EPROC", modalidade: "AUTOMATICA", perfil: "qualquer", status_verificacao: "pendente", automacao_cpn: "nao_homologada", url_certidao: "https://x.jus.br", prioridade: 1 } as unknown as RotaCertidao;
    expect(statusRota(pend).categoria).toBe("VERIFICAR");
  });
});
