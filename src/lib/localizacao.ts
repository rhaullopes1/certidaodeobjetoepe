/**
 * Localização do processo e escolha da unidade judicial — lógica pura e
 * determinística (sem IA, sem inferência). Tudo aqui é testável sem banco.
 */
import type { PartesNup } from "./cnj";
import type { Json, TablesInsert } from "@/integrations/supabase/types";

export type Confianca = "confirmado" | "parcial" | "nao_identificado";

export interface ProcessoDecodificado {
  reconhecido: boolean;
  digitoValido: boolean;
  formatado: string;
  ano: number | null;
  segmento: number | null;
  segmentoNome: string | null;
  tribunalSigla: string | null;
  tribunalNome: string | null;
  uf: string | null;
  /** Compatibilidade: cidade da comarca ou, na falta, sede do tribunal. */
  cidade: string | null;
  comarca: string | null;
  foro: string | null;
  codigoOrigem: string | null;
  sistema: string | null;
  /** Só preenchida por fonte oficial (DataJud). Nunca deduzida do código OOOO. */
  vara: string | null;
  unidadeJudiciaria: string | null;
  fonte: string | null;
  confianca: Confianca;
  dadosFonte: { [k: string]: Json } | null;
  mensagem: string | null;
}

export const DECODIFICACAO_VAZIA: ProcessoDecodificado = {
  reconhecido: false,
  digitoValido: false,
  formatado: "",
  ano: null,
  segmento: null,
  segmentoNome: null,
  tribunalSigla: null,
  tribunalNome: null,
  uf: null,
  cidade: null,
  comarca: null,
  foro: null,
  codigoOrigem: null,
  sistema: null,
  vara: null,
  unidadeJudiciaria: null,
  fonte: null,
  confianca: "nao_identificado",
  dadosFonte: null,
  mensagem: null,
};

export const FONTE_TABELA_CNJ = "Tabela CNJ (Resolução 65/2008) — base interna";

export interface TribunalRow {
  sigla: string;
  nome: string;
  uf: string | null;
  sede: string | null;
  sistema: string | null;
}
export interface ComarcaCnjRow {
  nome: string;
  cidade: string | null;
  uf: string | null;
  foro?: string | null;
}

/** Monta o resultado a partir das linhas encontradas nas tabelas CNJ. */
export function montarDecodificacao(
  partes: PartesNup,
  segmentoNome: string | null,
  tribunal: TribunalRow | null,
  comarca: ComarcaCnjRow | null,
): ProcessoDecodificado {
  const base: ProcessoDecodificado = {
    ...DECODIFICACAO_VAZIA,
    formatado: partes.formatado,
    ano: partes.ano,
    segmento: partes.segmento,
    segmentoNome,
    codigoOrigem: partes.codigoOrigem,
    digitoValido: partes.digitoValido,
  };

  if (!tribunal) {
    return {
      ...base,
      mensagem: "Não localizamos o tribunal para este código. Nossa equipe confere manualmente.",
    };
  }

  const confianca: Confianca =
    partes.digitoValido && comarca ? "confirmado" : "parcial";

  return {
    ...base,
    reconhecido: true,
    tribunalSigla: tribunal.sigla,
    tribunalNome: tribunal.nome,
    uf: comarca?.uf ?? tribunal.uf ?? null,
    cidade: comarca?.cidade ?? tribunal.sede ?? null,
    comarca: comarca?.nome ?? null,
    foro: comarca?.foro ?? null,
    sistema: tribunal.sistema,
    fonte: FONTE_TABELA_CNJ,
    confianca,
    mensagem: partes.digitoValido
      ? null
      : "O dígito verificador não confere. Revise o número informado.",
  };
}

/** Colunas de `pedidos` gravadas a partir da decodificação (null quando não identificado). */
export function colunasLocalizacao(
  dec: ProcessoDecodificado | null,
  agora = new Date(),
): Partial<TablesInsert<"pedidos">> {
  if (!dec) {
    return {
      processo_confianca: "nao_identificado",
      processo_fonte: null,
      processo_dados: { status: "numero_nao_reconhecido" },
    };
  }
  return {
    tribunal_sigla: dec.tribunalSigla,
    tribunal_nome: dec.tribunalNome,
    segmento_judiciario: dec.segmentoNome,
    uf_processo: dec.reconhecido ? dec.uf : null,
    cidade_processo: dec.comarca ? dec.cidade : null,
    comarca_processo: dec.comarca,
    foro: dec.foro,
    codigo_origem_cnj: dec.codigoOrigem,
    vara: dec.vara,
    unidade_judiciaria: dec.unidadeJudiciaria,
    sistema_processual: dec.sistema,
    processo_fonte: dec.fonte,
    processo_confianca: dec.confianca,
    processo_dados: {
      cnj: {
        fonte: dec.fonte,
        consultado_em: agora.toISOString(),
        digito_valido: dec.digitoValido,
        ano: dec.ano,
        segmento: dec.segmento,
      },
      ...(dec.dadosFonte ?? {}),
    },
  };
}

/** Campos de localização persistidos no pedido. */
export type ColunasPedidoLocalizacao = Partial<TablesInsert<"pedidos">>;

/**
 * Mescla a nova identificação CNJ com o que já está salvo, sem perder dado mais específico:
 * - vara/unidade (só DataJud/equipe) nunca são apagadas pela tabela CNJ;
 * - campo já preenchido não é trocado por null;
 * - identificação confirmada por outra fonte (ex.: DataJud) não é rebaixada.
 * Idempotente: aplicar duas vezes produz o mesmo resultado.
 */
export function mesclarLocalizacao(
  atual: ColunasPedidoLocalizacao,
  novo: ColunasPedidoLocalizacao,
): ColunasPedidoLocalizacao {
  const campos = [
    "tribunal_sigla", "tribunal_nome", "segmento_judiciario", "uf_processo", "cidade_processo",
    "comarca_processo", "foro", "codigo_origem_cnj", "sistema_processual",
  ] as const;
  const out: ColunasPedidoLocalizacao = {};
  for (const c of campos) {
    const v = novo[c] ?? atual[c] ?? null;
    (out as Record<string, unknown>)[c] = v;
  }
  const fonteExterna = !!atual.processo_fonte && atual.processo_fonte !== FONTE_TABELA_CNJ;
  if (fonteExterna && atual.processo_confianca === "confirmado") {
    out.processo_fonte = atual.processo_fonte;
    out.processo_confianca = atual.processo_confianca;
    // sistema informado pela fonte externa prevalece
    out.sistema_processual = atual.sistema_processual ?? out.sistema_processual;
  } else {
    out.processo_fonte = novo.processo_fonte ?? atual.processo_fonte ?? null;
    out.processo_confianca = out.processo_fonte
      ? (novo.processo_confianca ?? atual.processo_confianca ?? "parcial")
      : "nao_identificado";
  }
  const dadosAtuais = (atual.processo_dados ?? {}) as Record<string, Json>;
  const dadosNovos = (novo.processo_dados ?? {}) as Record<string, Json>;
  out.processo_dados = { ...dadosAtuais, cnj: dadosNovos["cnj"] ?? dadosAtuais["cnj"] ?? null };
  return out;
}

/** Fontes consideradas oficiais (publicação do próprio órgão). */
export function ehFonteOficial(tipo: string | null | undefined) {
  return !!tipo && /site oficial|di[aá]rio|portaria|resposta oficial/i.test(tipo);
}

/** Rótulo honesto da fonte de um contato. */
export function rotuloFonte(tipo: string | null | undefined) {
  if (!tipo) return "Sem fonte registrada";
  return ehFonteOficial(tipo) ? `Fonte oficial: ${tipo}` : `Fonte direta (não oficial): ${tipo}`;
}

/* ------------------------------------------------------------------ */
/* Unidade / contato                                                  */
/* ------------------------------------------------------------------ */

export interface UnidadeCandidata {
  id: string;
  tribunal: string | null;
  comarca: string;
  foro: string | null;
  codigo_origem_cnj: string | null;
  vara_cartorio: string | null;
  unidade_judiciaria: string | null;
  ativo?: boolean | null;
}

export interface CriteriosUnidade {
  tribunal: string | null;
  codigoOrigem: string | null;
  comarca: string | null;
  foro: string | null;
  vara: string | null;
}

const norm = (v: string | null | undefined) =>
  (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export type NivelUnidade = "vara" | "codigo_origem" | "foro" | "comarca";

/**
 * Escolhe o contato mais específico: vara > código de origem > foro > comarca.
 * Tribunal divergente elimina o candidato. Sem correspondência → null.
 */
export function escolherUnidade<T extends UnidadeCandidata>(
  lista: T[],
  c: CriteriosUnidade,
): { unidade: T; nivel: NivelUnidade } | null {
  const trib = norm(c.tribunal);
  let melhor: { unidade: T; nivel: NivelUnidade; pontos: number } | null = null;

  for (const u of lista) {
    if (u.ativo === false) continue;
    if (trib && u.tribunal && norm(u.tribunal) !== trib) continue;
    const mesmaComarca = !!c.comarca && norm(u.comarca) === norm(c.comarca);
    const mesmoCodigo =
      !!c.codigoOrigem && !!u.codigo_origem_cnj && u.codigo_origem_cnj === c.codigoOrigem;
    const localOk = mesmaComarca || mesmoCodigo;
    const varaU = norm(u.vara_cartorio) || norm(u.unidade_judiciaria);

    let nivel: NivelUnidade | null = null;
    let pontos = 0;
    if (c.vara && varaU && varaU === norm(c.vara) && localOk) {
      nivel = "vara";
      pontos = 4;
    } else if (mesmoCodigo && !varaU) {
      nivel = "codigo_origem";
      pontos = 3;
    } else if (c.foro && u.foro && norm(u.foro) === norm(c.foro) && !varaU) {
      nivel = "foro";
      pontos = 2;
    } else if (mesmaComarca && !varaU && !u.foro) {
      nivel = "comarca";
      pontos = 1;
    }
    if (nivel && (!melhor || pontos > melhor.pontos)) melhor = { unidade: u, nivel, pontos };
  }
  return melhor ? { unidade: melhor.unidade, nivel: melhor.nivel } : null;
}

/** Monta a URL oficial de consulta, somente se cadastrada. */
export function urlConsultaProcesso(modelo: string | null | undefined, numero: string) {
  if (!modelo || !/^https:\/\//i.test(modelo.trim())) return null;
  const digitos = numero.replace(/\D/g, "");
  return modelo
    .trim()
    .replace("{numero}", encodeURIComponent(numero))
    .replace("{digitos}", digitos);
}

export function urlHttpsSegura(url: string | null | undefined) {
  if (!url) return null;
  const v = url.trim();
  return /^https?:\/\/[^\s]+$/i.test(v) ? v : null;
}

/* ------------------------------------------------------------------ */
/* Exibição no painel                                                 */
/* ------------------------------------------------------------------ */

export interface PedidoLocalizacao {
  numero_processo: string;
  tribunal_sigla?: string | null;
  tribunal_nome?: string | null;
  segmento_judiciario?: string | null;
  uf_processo?: string | null;
  cidade_processo?: string | null;
  comarca_processo?: string | null;
  foro?: string | null;
  codigo_origem_cnj?: string | null;
  vara?: string | null;
  unidade_judiciaria?: string | null;
  sistema_processual?: string | null;
  processo_fonte?: string | null;
  processo_confianca?: string | null;
  processo_enriquecido_em?: string | null;
}

/** Linhas exibidas: somente campos com valor. */
export function camposLocalizacao(p: PedidoLocalizacao): { label: string; valor: string }[] {
  const tribunal = p.tribunal_sigla
    ? `${p.tribunal_sigla}${p.tribunal_nome ? ` — ${p.tribunal_nome}` : ""}`
    : null;
  const linhas: [string, string | null | undefined][] = [
    ["Número CNJ", p.numero_processo],
    ["Tribunal", tribunal],
    ["Segmento", p.segmento_judiciario],
    ["UF", p.uf_processo],
    ["Cidade", p.cidade_processo],
    ["Comarca", p.comarca_processo],
    ["Foro/Fórum", p.foro],
    ["Código de origem CNJ", p.codigo_origem_cnj],
    ["Vara", p.vara],
    ["Unidade judicial", p.unidade_judiciaria],
    ["Sistema processual", p.sistema_processual],
  ];
  return linhas
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([label, v]) => ({ label, valor: String(v) }));
}

/** Badge exibido. Sem fonte nunca é "confirmado". */
export function badgeConfianca(p: PedidoLocalizacao): Confianca {
  if (!p.processo_fonte) return p.tribunal_sigla ? "parcial" : "nao_identificado";
  if (p.processo_confianca === "confirmado") return "confirmado";
  if (p.processo_confianca === "parcial" || p.tribunal_sigla) return "parcial";
  return "nao_identificado";
}

/** Resumo curto para a fila: Tribunal · Comarca/Foro · Vara · Sistema. */
export function resumoLocalizacao(p: PedidoLocalizacao) {
  const local = [p.comarca_processo, p.foro].filter(Boolean).join(" / ");
  return [p.tribunal_sigla, local, p.vara, p.sistema_processual].filter(Boolean).join(" · ");
}
