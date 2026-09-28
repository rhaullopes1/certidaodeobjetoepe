import { describe, expect, it } from "vitest";
import { escolherUnidade } from "./localizacao";
import { resolverCanalSolicitacao, type TribunalCanal, type UnidadeCanal } from "./canal-solicitacao";

const base = (o: Partial<UnidadeCanal & { id: string; tribunal: string; codigo_origem_cnj: string | null }>) => ({
  id: "x", tribunal: "TJSP", comarca: "São Paulo", foro: null, codigo_origem_cnj: null,
  vara_cartorio: null, unidade_judiciaria: null, balcao_virtual_url: null,
  canal_solicitacao_tipo: null, canal_solicitacao_url: null, canal_solicitacao_email: null,
  canal_solicitacao_telefone: null, instrucoes_solicitacao: null, documentos_exigidos: null,
  taxa_info: null, prazo_info: null, fonte_url: "https://www.tjsp.jus.br/x",
  fonte_tipo: "Site oficial do tribunal", fonte_atualizada_em: "2026-09-28", ativo: true, ...o,
});
const TRIB: TribunalCanal = {
  sigla: "TJSP", balcao_virtual_url: "https://www.tjsp.jus.br/balcao", balcao_virtual_fonte: "Site oficial TJSP",
  balcao_virtual_verificada_em: "2026-09-28", certidoes_url: "https://www.tjsp.jus.br/certidoes",
  certidoes_tipo: "objeto_pe_via_unidade", certidoes_email: null, certidoes_telefone: null,
  certidoes_instrucoes: "Solicitar à unidade.", certidoes_fonte: "Site oficial TJSP", certidoes_verificada_em: "2026-09-28",
};
const crit = { tribunal: "TJSP", codigoOrigem: "0100", comarca: "São Paulo", foro: null, vara: "1ª Vara Cível" };

describe("onde solicitar — hierarquia e estados", () => {
  it("vara específica vence OOOO e comarca", () => {
    const lista = [
      base({ id: "com", canal_solicitacao_email: "com@tjsp.jus.br" }),
      base({ id: "ooo", codigo_origem_cnj: "0100", canal_solicitacao_email: "ooo@tjsp.jus.br" }),
      base({ id: "vara", vara_cartorio: "1ª Vara Cível", canal_solicitacao_url: "https://vara.tjsp.jus.br" }),
    ];
    const c = resolverCanalSolicitacao(escolherUnidade(lista, crit), TRIB);
    expect(c.status).toBe("confirmado");
    expect(c.nivel).toBe("vara");
    expect(c.url).toBe("https://vara.tjsp.jus.br");
    expect(c.fallback).toBe(false);
  });
  it("OOOO vence comarca quando não há vara", () => {
    const lista = [
      base({ id: "com", canal_solicitacao_email: "com@tjsp.jus.br" }),
      base({ id: "ooo", codigo_origem_cnj: "0100", canal_solicitacao_email: "ooo@tjsp.jus.br" }),
    ];
    const c = resolverCanalSolicitacao(escolherUnidade(lista, { ...crit, vara: null }), TRIB);
    expect(c.nivel).toBe("codigo_origem");
    expect(c.email).toBe("ooo@tjsp.jus.br");
    expect(c.tipos).toContain("email");
  });
  it("unidade sem canal cai para CANAL DO TRIBUNAL (fallback identificado)", () => {
    const lista = [base({ codigo_origem_cnj: "0100", unidade_judiciaria: "Fórum João Mendes" })];
    const c = resolverCanalSolicitacao(escolherUnidade(lista, { ...crit, vara: null }), TRIB);
    expect(c.status).toBe("canal_tribunal");
    expect(c.fallback).toBe(true);
    expect(c.url).toBe("https://www.tjsp.jus.br/certidoes");
    expect(c.unidadeResponsavel).toMatch(/vara competente não cadastrada/);
  });
  it("canal de unidade sem fonte/data não é CONFIRMADO", () => {
    const lista = [base({ codigo_origem_cnj: "0100", canal_solicitacao_email: "a@b.jus.br", fonte_tipo: null, fonte_atualizada_em: null })];
    const c = resolverCanalSolicitacao(escolherUnidade(lista, { ...crit, vara: null }), null);
    expect(c.status).toBe("nao_cadastrado");
  });
  it("canal do tribunal sem fonte é ignorado → NÃO CADASTRADO", () => {
    const c = resolverCanalSolicitacao(null, { ...TRIB, certidoes_fonte: null, balcao_virtual_fonte: null });
    expect(c.status).toBe("nao_cadastrado");
    expect(c.url).toBeNull();
  });
  it("nada cadastrado → NÃO CADASTRADO sem dados inventados", () => {
    const c = resolverCanalSolicitacao(null, null);
    expect(c).toMatchObject({ status: "nao_cadastrado", url: null, email: null, telefone: null, taxa: null, prazo: null });
  });
  it("URL não-https nunca é exibida", () => {
    const lista = [base({ codigo_origem_cnj: "0100", canal_solicitacao_url: "http://inseguro" })];
    const c = resolverCanalSolicitacao(escolherUnidade(lista, { ...crit, vara: null }), null);
    expect(c.status).toBe("nao_cadastrado");
  });
});
