/**
 * "Onde solicitar" a Certidão de Objeto e Pé — lógica pura, sem IA.
 * Usa somente dados cadastrados (comarcas_contatos + cnj_tribunais) e exige fonte.
 * Prioridade: vara/unidade > código OOOO > foro > comarca > canal oficial do tribunal.
 * DataJud não é usado aqui: canal vem apenas do cadastro oficial.
 */
import type { NivelUnidade } from "./localizacao";

export type StatusCanal = "confirmado" | "canal_tribunal" | "nao_cadastrado";
export type TipoCanal =
  | "portal" | "formulario" | "email" | "telefone" | "balcao_virtual" | "presencial";

export const ROTULO_STATUS: Record<StatusCanal, string> = {
  confirmado: "Confirmado",
  canal_tribunal: "Canal do tribunal",
  nao_cadastrado: "Não cadastrado",
};

export const ROTULO_TIPO: Record<TipoCanal, string> = {
  portal: "Portal/página oficial",
  formulario: "Formulário oficial",
  email: "E-mail",
  telefone: "Telefone",
  balcao_virtual: "Balcão Virtual",
  presencial: "Presencial",
};

export interface UnidadeCanal {
  comarca: string;
  foro: string | null;
  vara_cartorio: string | null;
  unidade_judiciaria: string | null;
  balcao_virtual_url: string | null;
  canal_solicitacao_tipo: string | null;
  canal_solicitacao_url: string | null;
  canal_solicitacao_email: string | null;
  canal_solicitacao_telefone: string | null;
  instrucoes_solicitacao: string | null;
  documentos_exigidos: string | null;
  taxa_info: string | null;
  prazo_info: string | null;
  fonte_url: string | null;
  fonte_tipo: string | null;
  fonte_atualizada_em: string | null;
}

export interface TribunalCanal {
  sigla: string;
  balcao_virtual_url: string | null;
  balcao_virtual_fonte: string | null;
  balcao_virtual_verificada_em: string | null;
  certidoes_url: string | null;
  certidoes_tipo: string | null;
  certidoes_email: string | null;
  certidoes_telefone: string | null;
  certidoes_instrucoes: string | null;
  certidoes_fonte: string | null;
  certidoes_verificada_em: string | null;
}

export interface CanalSolicitacao {
  status: StatusCanal;
  origem: "unidade" | "tribunal" | null;
  nivel: NivelUnidade | null;
  /** true quando é o canal do tribunal usado por falta de canal específico. */
  fallback: boolean;
  tipos: TipoCanal[];
  unidadeResponsavel: string | null;
  url: string | null;
  email: string | null;
  telefone: string | null;
  balcaoVirtualUrl: string | null;
  instrucoes: string | null;
  documentos: string | null;
  taxa: string | null;
  prazo: string | null;
  fonte: string | null;
  fonteUrl: string | null;
  fonteData: string | null;
  rotuloCanalTribunal: string | null;
}

const https = (v: string | null | undefined) => {
  const s = (v ?? "").trim();
  return /^https:\/\/\S+$/i.test(s) ? s : null;
};
const txt = (v: string | null | undefined) => {
  const s = (v ?? "").trim();
  return s || null;
};

export function nomeUnidade(u: UnidadeCanal) {
  return txt(u.unidade_judiciaria) ?? txt(u.vara_cartorio) ?? txt(u.foro) ?? u.comarca;
}

function tiposDaUnidade(u: UnidadeCanal): TipoCanal[] {
  const t = new Set<TipoCanal>();
  const declarado = txt(u.canal_solicitacao_tipo) as TipoCanal | null;
  if (declarado && declarado in ROTULO_TIPO) t.add(declarado);
  if (https(u.canal_solicitacao_url) && !declarado) t.add("portal");
  if (txt(u.canal_solicitacao_email)) t.add("email");
  if (txt(u.canal_solicitacao_telefone)) t.add("telefone");
  if (https(u.balcao_virtual_url)) t.add("balcao_virtual");
  return [...t];
}

export function rotuloCertidoesTribunal(tipo: string | null | undefined) {
  if (tipo === "especifica_objeto_pe") return "Certidão de Objeto e Pé (página oficial do tribunal)";
  if (tipo === "objeto_pe_via_unidade") return "Certidão de Objeto e Pé — solicitar à unidade judicial";
  return "Certidões — canal geral do tribunal";
}

const VAZIO: Omit<CanalSolicitacao, "status"> = {
  origem: null, nivel: null, fallback: false, tipos: [], unidadeResponsavel: null,
  url: null, email: null, telefone: null, balcaoVirtualUrl: null, instrucoes: null,
  documentos: null, taxa: null, prazo: null, fonte: null, fonteUrl: null, fonteData: null,
  rotuloCanalTribunal: null,
};

/**
 * Resolve o canal. `escolha` deve vir de escolherUnidade() (já aplica a
 * hierarquia vara > OOOO > foro > comarca). Canal da unidade só conta com
 * fonte + data registradas; sem isso cai para o tribunal.
 */
export function resolverCanalSolicitacao(
  escolha: { unidade: UnidadeCanal; nivel: NivelUnidade } | null,
  tribunal: TribunalCanal | null,
): CanalSolicitacao {
  const u = escolha?.unidade ?? null;
  if (u) {
    const tipos = tiposDaUnidade(u);
    const temCanal =
      !!https(u.canal_solicitacao_url) || !!txt(u.canal_solicitacao_email) ||
      !!txt(u.canal_solicitacao_telefone) || !!https(u.balcao_virtual_url) ||
      txt(u.canal_solicitacao_tipo) === "presencial";
    const temFonte = !!txt(u.fonte_tipo) && !!txt(u.fonte_atualizada_em);
    if (temCanal && temFonte) {
      return {
        ...VAZIO,
        status: "confirmado",
        origem: "unidade",
        nivel: escolha!.nivel,
        tipos,
        unidadeResponsavel: nomeUnidade(u),
        url: https(u.canal_solicitacao_url),
        email: txt(u.canal_solicitacao_email),
        telefone: txt(u.canal_solicitacao_telefone),
        balcaoVirtualUrl: https(u.balcao_virtual_url),
        instrucoes: txt(u.instrucoes_solicitacao),
        documentos: txt(u.documentos_exigidos),
        taxa: txt(u.taxa_info),
        prazo: txt(u.prazo_info),
        fonte: txt(u.fonte_tipo),
        fonteUrl: https(u.fonte_url),
        fonteData: txt(u.fonte_atualizada_em),
      };
    }
  }

  if (tribunal) {
    const cert = https(tribunal.certidoes_url) && txt(tribunal.certidoes_fonte) ? https(tribunal.certidoes_url) : null;
    const balcao =
      https(tribunal.balcao_virtual_url) && txt(tribunal.balcao_virtual_fonte) ? https(tribunal.balcao_virtual_url) : null;
    if (cert || balcao) {
      const tipos: TipoCanal[] = [];
      if (cert) tipos.push("portal");
      if (balcao) tipos.push("balcao_virtual");
      return {
        ...VAZIO,
        status: "canal_tribunal",
        origem: "tribunal",
        fallback: true,
        tipos,
        unidadeResponsavel: u
          ? `${nomeUnidade(u)} (vara competente não cadastrada)`
          : "Vara/unidade onde tramita o processo (não cadastrada)",
        url: cert,
        balcaoVirtualUrl: balcao,
        instrucoes: cert ? txt(tribunal.certidoes_instrucoes) : null,
        fonte: cert ? txt(tribunal.certidoes_fonte) : txt(tribunal.balcao_virtual_fonte),
        fonteData: cert ? txt(tribunal.certidoes_verificada_em) : txt(tribunal.balcao_virtual_verificada_em),
        rotuloCanalTribunal: cert ? rotuloCertidoesTribunal(tribunal.certidoes_tipo) : "Balcão Virtual — canal geral do tribunal",
      };
    }
  }

  return { ...VAZIO, status: "nao_cadastrado" };
}
