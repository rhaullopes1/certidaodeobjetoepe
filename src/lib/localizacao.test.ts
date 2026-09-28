import { describe, expect, it, vi } from "vitest";
import { analisarNup, digitoVerificadorNup } from "./cnj";
import {
  badgeConfianca,
  camposLocalizacao,
  colunasLocalizacao,
  escolherUnidade,
  montarDecodificacao,
  resumoLocalizacao,
  urlConsultaProcesso,
  type UnidadeCandidata,
} from "./localizacao";
import { consultarDatajud } from "./datajud.server";
import { validarFonteUnidade } from "./admin";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

// Número CNJ válido montado com o dígito oficial: TJSP (8.26), origem 0100.
const dv = digitoVerificadorNup("1234567", "2023", "8", "26", "0100");
const NUMERO = `1234567${dv}2023826` + "0100";
const TJSP = { sigla: "TJSP", nome: "Tribunal de Justiça de São Paulo", uf: "SP", sede: "São Paulo", sistema: "e-SAJ" };
const COMARCA = { nome: "Foro Central Cível da Comarca de São Paulo", cidade: "São Paulo", uf: "SP", foro: null };

describe("parser CNJ", () => {
  it("extrai partes e valida dígito", () => {
    const p = analisarNup(NUMERO)!;
    expect(p.segmento).toBe(8);
    expect(p.codigoTribunal).toBe("26");
    expect(p.codigoOrigem).toBe("0100");
    expect(p.digitoValido).toBe(true);
  });
  it("detecta dígito inválido", () => {
    const errado = NUMERO.slice(0, 7) + (dv === "00" ? "01" : "00") + NUMERO.slice(9);
    expect(analisarNup(errado)!.digitoValido).toBe(false);
  });
  it("rejeita número incompleto", () => {
    expect(analisarNup("123")).toBeNull();
  });
});

describe("decodificação", () => {
  const p = analisarNup(NUMERO)!;
  it("tribunal + comarca = confirmado, sem vara", () => {
    const d = montarDecodificacao(p, "Justiça Estadual", TJSP, COMARCA);
    expect(d.tribunalSigla).toBe("TJSP");
    expect(d.comarca).toBe(COMARCA.nome);
    expect(d.codigoOrigem).toBe("0100");
    expect(d.confianca).toBe("confirmado");
    expect(d.vara).toBeNull();
  });
  it("sem comarca cadastrada = parcial, comarca null", () => {
    const d = montarDecodificacao(p, "Justiça Estadual", TJSP, null);
    expect(d.confianca).toBe("parcial");
    expect(d.comarca).toBeNull();
    const cols = colunasLocalizacao(d);
    expect(cols.cidade_processo).toBeNull();
    expect(cols.vara).toBeNull();
  });
  it("tribunal desconhecido = não identificado, sem fonte", () => {
    const d = montarDecodificacao(p, null, null, null);
    expect(d.reconhecido).toBe(false);
    expect(d.fonte).toBeNull();
    expect(d.confianca).toBe("nao_identificado");
  });
  it("persistência de número não reconhecido não inventa campos", () => {
    const cols = colunasLocalizacao(null);
    expect(cols.processo_confianca).toBe("nao_identificado");
    expect(cols.tribunal_sigla).toBeUndefined();
  });
});

describe("escolha da unidade", () => {
  const base: UnidadeCandidata = {
    id: "", tribunal: "TJSP", comarca: "Campinas", foro: null, codigo_origem_cnj: null,
    vara_cartorio: null, unidade_judiciaria: null,
  };
  const lista = [
    { ...base, id: "comarca" },
    { ...base, id: "vara", vara_cartorio: "2ª Vara Cível" },
    { ...base, id: "outro-trib", tribunal: "TJRJ", vara_cartorio: "2ª Vara Cível" },
  ];
  it("prefere a vara quando confirmada", () => {
    const r = escolherUnidade(lista, { tribunal: "TJSP", codigoOrigem: null, comarca: "Campinas", foro: null, vara: "2ª Vara Cível" });
    expect(r?.unidade.id).toBe("vara");
  });
  it("sem vara cai para a comarca", () => {
    const r = escolherUnidade(lista, { tribunal: "TJSP", codigoOrigem: null, comarca: "campinas", foro: null, vara: null });
    expect(r?.unidade.id).toBe("comarca");
    expect(r?.nivel).toBe("comarca");
  });
  it("sem correspondência retorna null", () => {
    expect(escolherUnidade(lista, { tribunal: "TJSP", codigoOrigem: null, comarca: "Santos", foro: null, vara: null })).toBeNull();
  });
});

describe("painel com dados parciais", () => {
  const parcial = { numero_processo: "0000", tribunal_sigla: "TJSP", sistema_processual: "e-SAJ" };
  it("mostra só campos existentes", () => {
    const labels = camposLocalizacao(parcial).map((c) => c.label);
    expect(labels).toEqual(["Número CNJ", "Tribunal", "Sistema processual"]);
  });
  it("nunca confirmado sem fonte", () => {
    expect(badgeConfianca({ ...parcial, processo_confianca: "confirmado" })).toBe("parcial");
    expect(badgeConfianca({ numero_processo: "0" })).toBe("nao_identificado");
  });
  it("resumo da fila", () => {
    expect(resumoLocalizacao({ ...parcial, comarca_processo: "Campinas" })).toBe("TJSP · Campinas · e-SAJ");
  });
  it("link do tribunal só com URL https cadastrada", () => {
    expect(urlConsultaProcesso(null, NUMERO)).toBeNull();
    expect(urlConsultaProcesso("javascript:x", NUMERO)).toBeNull();
    expect(urlConsultaProcesso("https://x.jus.br/?n={digitos}", NUMERO)).toBe(`https://x.jus.br/?n=${NUMERO}`);
  });
});

describe("fonte obrigatória", () => {
  it("contato sem fonte é recusado", () => {
    expect(validarFonteUnidade({ telefone: "1133334444" })).toMatch(/fonte/);
    expect(validarFonteUnidade({ telefone: "1133334444", fonte_tipo: "Contato direto com a unidade", fonte_atualizada_em: "2026-09-28" })).toBeNull();
    expect(validarFonteUnidade({ comarca: "X" })).toBeNull();
  });
});

describe("DataJud", () => {
  it("sem credencial = não configurado", async () => {
    const r = await consultarDatajud(NUMERO, "TJSP", { apiKey: "" });
    expect(r.status).toBe("nao_configurado");
  });
  it("indisponível não lança erro", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("rede")) as unknown as typeof fetch;
    const r = await consultarDatajud(NUMERO, "TJSP", { apiKey: "k", fetchImpl });
    expect(r.status).toBe("indisponivel");
    expect(r.orgaoJulgador).toBeNull();
  });
  it("normaliza o órgão julgador", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ hits: { hits: [{ _source: { numeroProcesso: NUMERO, orgaoJulgador: { nome: "2ª Vara Cível", codigo: 1 }, sistema: { nome: "SAJ" }, assuntos: [{ nome: "Cobrança" }] } }] } })),
    ) as unknown as typeof fetch;
    const r = await consultarDatajud(NUMERO, "TJSP", { apiKey: "k", fetchImpl });
    expect(r.status).toBe("ok");
    expect(r.orgaoJulgador).toBe("2ª Vara Cível");
  });
});

import { mesclarLocalizacao, rotuloFonte, FONTE_TABELA_CNJ } from "./localizacao";

describe("fase 2", () => {
  const p = analisarNup(NUMERO)!;
  const cnj = colunasLocalizacao(montarDecodificacao(p, "Justiça Estadual", TJSP, COMARCA));

  it("código OOOO nunca vira vara", () => {
    expect(cnj.vara).toBeNull();
    expect(cnj.unidade_judiciaria).toBeNull();
    expect(cnj.codigo_origem_cnj).toBe("0100");
  });
  it("reidentificação é idempotente", () => {
    const a = mesclarLocalizacao({}, cnj);
    const b = mesclarLocalizacao(a, cnj);
    const { processo_dados: _x, ...ra } = a;
    const { processo_dados: _y, ...rb } = b;
    expect(rb).toEqual(ra);
  });
  it("não rebaixa confirmação do DataJud nem apaga vara", () => {
    const atual = { vara: "2ª Vara Cível", processo_fonte: "DataJud CNJ — API Pública", processo_confianca: "confirmado", sistema_processual: "SAJ" };
    const r = mesclarLocalizacao(atual, colunasLocalizacao(montarDecodificacao(p, null, TJSP, null)));
    expect(r.processo_confianca).toBe("confirmado");
    expect(r.processo_fonte).toContain("DataJud");
    expect("vara" in r).toBe(false); // vara não é tocada pela mescla
  });
  it("sem fonte não é confirmado", () => {
    const r = mesclarLocalizacao({}, { processo_confianca: "confirmado", processo_fonte: null });
    expect(r.processo_confianca).toBe("nao_identificado");
    expect(FONTE_TABELA_CNJ).toBeTruthy();
  });
  it("campo existente não vira null", () => {
    const r = mesclarLocalizacao({ comarca_processo: "Campinas" }, { comarca_processo: null, processo_fonte: FONTE_TABELA_CNJ, processo_confianca: "parcial" });
    expect(r.comarca_processo).toBe("Campinas");
  });
  it("fonte direta não é chamada de oficial", () => {
    expect(rotuloFonte("Contato direto com a unidade")).toMatch(/não oficial/);
    expect(rotuloFonte("Site oficial do tribunal")).toMatch(/^Fonte oficial/);
  });
  it("prioridade código de origem > comarca", () => {
    const base = { tribunal: "TJSP", comarca: "São Paulo", foro: null, vara_cartorio: null, unidade_judiciaria: null, codigo_origem_cnj: null };
    const r = escolherUnidade([{ ...base, id: "c" }, { ...base, id: "o", codigo_origem_cnj: "0100" }], { tribunal: "TJSP", codigoOrigem: "0100", comarca: "São Paulo", foro: null, vara: null });
    expect(r?.unidade.id).toBe("o");
  });
  it("DataJud com resposta vazia e limite", async () => {
    const vazio = vi.fn().mockResolvedValue(new Response(JSON.stringify({ hits: { hits: [] } }))) as unknown as typeof fetch;
    expect((await consultarDatajud(NUMERO, "TJSP", { apiKey: "k", fetchImpl: vazio })).status).toBe("nao_encontrado");
    const lim = vi.fn().mockResolvedValue(new Response("", { status: 429 })) as unknown as typeof fetch;
    expect((await consultarDatajud(NUMERO, "TJSP", { apiKey: "k", fetchImpl: lim })).status).toBe("limite_requisicoes");
  });
});

import { aliasDatajud } from "./datajud.server";
describe("DataJud fase 3", () => {
  it("rejeita resposta de outro processo", async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ hits: { hits: [{ _source: { numeroProcesso: "999", orgaoJulgador: { nome: "X" } } }] } }))) as unknown as typeof fetch;
    const r = await consultarDatajud(NUMERO, "TJSP", { apiKey: "k", fetchImpl: f });
    expect(r.status).toBe("nao_encontrado");
    expect(r.orgaoJulgador).toBeNull();
  });
  it("só aceita aliases oficiais", () => {
    expect(aliasDatajud("TJSP")).toBe("tjsp");
    expect(aliasDatajud("TRE-SP")).toBe("tre-sp");
    expect(aliasDatajud("TJDFT")).toBe("tjdft");
    expect(aliasDatajud("TJXX")).toBeNull();
    expect(aliasDatajud("CNJ")).toBeNull();
  });
});

describe("DataJud fase 4", () => {
  it("TJDF usa o alias oficial tjdft", () => {
    expect(aliasDatajud("TJDF")).toBe("tjdft");
  });
});
