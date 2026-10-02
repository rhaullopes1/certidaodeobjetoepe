/**
 * Enriquecimento da CPN a partir da base existente — lógica pura, sem IA.
 * CNJ → cnj_tribunais → cnj_comarcas (código de origem) → comarcas_contatos (unidade) → canais.
 * Canal geral do tribunal NUNCA é tratado como rota específica da Objeto e Pé:
 * a rota continua vindo de cpn_certificate_routes (e fica VERIFICAR até homologação).
 */
import { escolherUnidade, type NivelUnidade } from "./localizacao";
import { resolverCanalSolicitacao, nomeUnidade, type CanalSolicitacao, type TribunalCanal, type UnidadeCanal } from "./canal-solicitacao";

export interface TribunalEnriq extends TribunalCanal {
  nome: string;
  uf: string | null;
  consulta_processual_url: string | null;
  consulta_processual_fonte: string | null;
  consulta_processual_verificada_em: string | null;
}
export interface ComarcaCnjEnriq { nome: string; cidade: string | null; uf: string | null; foro: string | null; fonte_url?: string | null; fonte_atualizada_em?: string | null }
export interface UnidadeEnriq extends UnidadeCanal {
  id: string;
  tribunal: string | null;
  codigo_origem_cnj: string | null;
  endereco: string | null;
  cep: string | null;
  responsavel_nome: string | null;
  responsavel_setor: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

export type OrigemDado = "numero_cnj" | "tabela_cnj" | "datajud" | "cadastro_unidade" | "cadastro_tribunal";
export const ROTULO_ORIGEM: Record<OrigemDado, string> = {
  numero_cnj: "número CNJ",
  tabela_cnj: "tabela CNJ interna",
  datajud: "DataJud (CNJ)",
  cadastro_unidade: "cadastro da unidade",
  cadastro_tribunal: "cadastro do tribunal",
};

export interface CampoEnriq { rotulo: string; valor: string; origem: OrigemDado; url?: boolean }
export interface CanalGeral { rotulo: string; url: string; fonte: string | null; verificadaEm: string | null }

export interface Enriquecimento {
  campos: CampoEnriq[];
  unidade: { id: string; nome: string; nivel: NivelUnidade } | null;
  /** Canal de emissão: específico da unidade ("confirmado") ou fallback do tribunal ("canal_tribunal"). */
  canal: CanalSolicitacao;
  /** Canais gerais do tribunal — contexto, não rota. */
  canaisGerais: CanalGeral[];
  fonteUnidade: { tipo: string | null; url: string | null; data: string | null } | null;
}

const https = (v: string | null | undefined) => (v && /^https:\/\/\S+$/i.test(v.trim()) ? v.trim() : null);
const txt = (v: string | null | undefined) => (v ?? "").trim() || null;

export function montarEnriquecimento(e: {
  tribunal: TribunalEnriq | null;
  segmento: string | null;
  codigoOrigem: string | null;
  comarcaCnj: ComarcaCnjEnriq | null;
  unidades: UnidadeEnriq[];
  vara: string | null;
}): Enriquecimento {
  const t = e.tribunal;
  const campos: CampoEnriq[] = [];
  const add = (rotulo: string, valor: string | null | undefined, origem: OrigemDado, url = false) => {
    const v = txt(valor);
    if (v) campos.push({ rotulo, valor: v, origem, ...(url ? { url } : {}) });
  };
  if (t) add("Tribunal", `${t.sigla} — ${t.nome}`, "tabela_cnj");
  add("UF", e.comarcaCnj?.uf ?? t?.uf, "tabela_cnj");
  add("Segmento", e.segmento, "tabela_cnj");
  add("Código de origem (OOOO)", e.codigoOrigem, "numero_cnj");
  add("Comarca", e.comarcaCnj?.nome, "tabela_cnj");
  if (e.comarcaCnj?.foro !== e.comarcaCnj?.nome) add("Foro", e.comarcaCnj?.foro, "tabela_cnj");
  add("Órgão julgador", e.vara, "datajud");

  const escolha = t
    ? escolherUnidade(e.unidades.filter((u) => u.ativo !== false), {
        tribunal: t.sigla, codigoOrigem: e.codigoOrigem, comarca: e.comarcaCnj?.nome ?? null, foro: e.comarcaCnj?.foro ?? null, vara: e.vara,
      })
    : null;
  const u = escolha?.unidade ?? null;
  if (u) {
    add("Unidade judiciária", nomeUnidade(u), "cadastro_unidade");
    add("Endereço", [u.endereco, u.cep ? `CEP ${u.cep}` : null].filter(Boolean).join(" · "), "cadastro_unidade");
    add("Responsável/setor", [u.responsavel_nome, u.responsavel_setor].filter(Boolean).join(" · "), "cadastro_unidade");
    add("Telefone da unidade", u.telefone, "cadastro_unidade");
    add("E-mail da unidade", u.email, "cadastro_unidade");
  }

  const canal = resolverCanalSolicitacao(escolha, t);

  const canaisGerais: CanalGeral[] = [];
  if (t) {
    const g = (rotulo: string, url: string | null, fonte: string | null, data: string | null) => {
      const ok = https(url);
      if (ok) canaisGerais.push({ rotulo, url: ok, fonte: txt(fonte), verificadaEm: txt(data) });
    };
    g("Consulta processual oficial", t.consulta_processual_url, t.consulta_processual_fonte, t.consulta_processual_verificada_em);
    g("Balcão Virtual (canal geral do tribunal)", t.balcao_virtual_url, t.balcao_virtual_fonte, t.balcao_virtual_verificada_em);
    g("Página oficial de certidões (canal geral)", t.certidoes_url, t.certidoes_fonte, t.certidoes_verificada_em);
  }

  return {
    campos,
    unidade: u && escolha ? { id: u.id, nome: nomeUnidade(u), nivel: escolha.nivel } : null,
    canal,
    canaisGerais,
    fonteUnidade: u ? { tipo: txt(u.fonte_tipo), url: https(u.fonte_url), data: txt(u.fonte_atualizada_em) } : null,
  };
}

/** Instruções "Solicitar nesta unidade/canal" só com dados cadastrados. */
export function instrucoesEncaminhamento(en: Enriquecimento): string[] {
  const c = en.canal;
  if (c.status === "nao_cadastrado") {
    return ["Unidade/canal de emissão não identificado na base — verificar em fonte oficial antes de encaminhar."];
  }
  const l: string[] = [];
  if (c.status === "canal_tribunal") {
    l.push(`Canal geral do tribunal — confirmar se atende esta certidão/unidade. ${c.unidadeResponsavel ?? ""}`.trim());
  } else {
    l.push(`Solicitar na unidade: ${c.unidadeResponsavel}.`);
  }
  if (c.email) l.push(`E-mail: ${c.email}`);
  if (c.telefone) l.push(`Telefone: ${c.telefone}`);
  if (c.url) l.push(`Canal: ${c.url}`);
  if (c.balcaoVirtualUrl) l.push(`Balcão Virtual: ${c.balcaoVirtualUrl}`);
  if (c.instrucoes) l.push(`Instruções cadastradas: ${c.instrucoes}`);
  if (c.documentos) l.push(`Documentos: ${c.documentos}`);
  if (c.fonte) l.push(`Fonte: ${c.fonte}${c.fonteData ? ` (${c.fonteData})` : ""}`);
  return l;
}
