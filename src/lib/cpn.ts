/**
 * CPN — Certidão Processual Nacional (uso interno do operador).
 * Motor de rotas puro e determinístico: escolhe a rota cadastrada (dados) para um processo.
 * Nunca presume que PJe/eproc = emissão automática: só vale o que está cadastrado/verificado.
 */
import type { Json } from "@/integrations/supabase/types";

export type Modalidade = "AUTOMATICA" | "SEMIAUTOMATICA" | "MANUAL" | "INDISPONIVEL" | "VERIFICAR";

/** Modalidade DECLARADA no cadastro (como o tribunal oferece o serviço) — não indica execução pela CPN. */
export const MODALIDADES: Record<Modalidade, { rotulo: string; emoji: string; classe: string; descricao: string }> = {
  AUTOMATICA: { rotulo: "Tribunal: emissão automática", emoji: "", classe: "bg-secondary text-foreground ring-border", descricao: "Segundo o cadastro, o portal do tribunal emite automaticamente no fluxo elegível (não é execução pela CPN)." },
  SEMIAUTOMATICA: { rotulo: "Tribunal: portal online", emoji: "", classe: "bg-secondary text-foreground ring-border", descricao: "Portal online do tribunal; exige ação do operador." },
  MANUAL: { rotulo: "Tribunal: solicitação manual", emoji: "", classe: "bg-secondary text-foreground ring-border", descricao: "Solicitação manual à unidade/tribunal." },
  INDISPONIVEL: { rotulo: "Tribunal: indisponível", emoji: "", classe: "bg-destructive/10 text-destructive ring-destructive/30", descricao: "Serviço indisponível segundo o cadastro." },
  VERIFICAR: { rotulo: "VERIFICAR", emoji: "⚪", classe: "bg-secondary text-muted-foreground ring-border", descricao: "Sem rota cadastrada/verificada para este contexto." },
};

export const STATUS_OPERACAO = {
  preparado: "Preparado",
  aguardando: "Aguardando",
  solicitado: "Solicitado",
  em_analise: "Em análise",
  recebido: "Recebido",
  entregue: "Entregue",
  sem_resposta: "Sem resposta",
  encerrado: "Encerrado",
} as const;
export type StatusOperacao = keyof typeof STATUS_OPERACAO;

export interface CanalRota { tipo: string; rotulo: string; valor: string | null }

export interface RotaCertidao {
  id: string;
  sistema: string | null;
  grau: string | null;
  tipo_certidao: string;
  modalidade: string;
  metodo: string;
  url_fonte: string | null;
  url_certidao: string | null;
  exige_login: boolean | null;
  exige_advogado: boolean | null;
  exige_peticao: boolean | null;
  exige_pagamento: boolean | null;
  custo: string | null;
  prazo: string | null;
  autenticidade_url: string | null;
  requisitos: string | null;
  observacoes: string | null;
  excecoes: string | null;
  texto_base_solicitacao: string | null;
  fonte_evidencia: string | null;
  automacao_cpn: string;
  prioridade: number;
  ultima_verificacao: string | null;
  status_verificacao?: string | null;
  tipo_rota?: string | null;
  perfil?: string | null;
  quem_pode?: string | null;
  passos?: Json | null;
  canais?: Json | null;
  exige_procuracao?: boolean | null;
  exige_identificacao?: boolean | null;
  exige_finalidade?: boolean | null;
  forma_entrega?: string | null;
  fonte_trecho?: string | null;
}

export interface ContextoProcesso {
  sistema: string | null;
  grau: string | null;
  /** nivelSigilo da fonte; > 0 = segredo de justiça. null = não informado. */
  nivelSigilo: number | null;
}

export interface RotaEscolhida {
  modalidade: Modalidade;
  rota: RotaCertidao | null;
  alertas: string[];
  /** Outras rotas compatíveis (ex.: terceiros, sigilo, 2º grau). */
  alternativas?: RotaCertidao[];
}

/* ---------------- Tipos de rota e status (motor de rotas) ---------------- */

export type TipoRota =
  | "AUTO_API" | "AUTO_PORTAL" | "AUTO_EPROC" | "AUTO_PJE" | "ASSISTIDA_EPROC" | "ASSISTIDA_PJE"
  | "MANUAL_BALCAO_VIRTUAL" | "MANUAL_EMAIL" | "MANUAL_FORMULARIO" | "MANUAL_PRESENCIAL" | "VERIFICAR" | "INDISPONIVEL";
export type CategoriaRota = "AUTOMATICA" | "ASSISTIDA" | "MANUAL" | "VERIFICAR" | "INDISPONIVEL";

/** Natureza deixa explícito QUEM executa: tribunal, operador assistido pela CPN, unidade, ou integração CPN. */
export const TIPOS_ROTA: Record<TipoRota, { categoria: CategoriaRota; rotulo: string; natureza: string }> = {
  AUTO_API: { categoria: "AUTOMATICA", rotulo: "Integração automática CPN (API)", natureza: "Integração automática da CPN — só vale se homologada." },
  AUTO_PORTAL: { categoria: "AUTOMATICA", rotulo: "Emissão automática no portal do tribunal", natureza: "Emissão automática pelo próprio tribunal (portal)." },
  AUTO_EPROC: { categoria: "AUTOMATICA", rotulo: "Emissão automática no eproc", natureza: "Emissão automática pelo próprio tribunal no eproc, por quem tem perfil habilitado." },
  AUTO_PJE: { categoria: "AUTOMATICA", rotulo: "Emissão automática no PJe", natureza: "Emissão automática pelo próprio tribunal no PJe, por quem tem perfil habilitado." },
  ASSISTIDA_EPROC: { categoria: "ASSISTIDA", rotulo: "Solicitação assistida — eproc", natureza: "Operador executa no eproc com acesso autorizado; a CPN orienta e registra." },
  ASSISTIDA_PJE: { categoria: "ASSISTIDA", rotulo: "Solicitação assistida — PJe", natureza: "Operador executa no PJe com acesso autorizado; a CPN orienta e registra." },
  MANUAL_BALCAO_VIRTUAL: { categoria: "MANUAL", rotulo: "Pedido à unidade — Balcão Virtual", natureza: "Solicitação manual à unidade judicial." },
  MANUAL_EMAIL: { categoria: "MANUAL", rotulo: "Pedido à unidade — e-mail institucional", natureza: "Solicitação manual à unidade judicial." },
  MANUAL_FORMULARIO: { categoria: "MANUAL", rotulo: "Formulário oficial", natureza: "Solicitação manual por formulário oficial do tribunal." },
  MANUAL_PRESENCIAL: { categoria: "MANUAL", rotulo: "Pedido presencial", natureza: "Solicitação presencial na unidade." },
  VERIFICAR: { categoria: "VERIFICAR", rotulo: "Verificar", natureza: "Procedimento ainda não classificado." },
  INDISPONIVEL: { categoria: "INDISPONIVEL", rotulo: "Indisponível", natureza: "Serviço indisponível segundo a fonte." },
};

export const CATEGORIAS_ROTA: Record<CategoriaRota, { rotulo: string; emoji: string; classe: string }> = {
  AUTOMATICA: { rotulo: "AUTOMÁTICA", emoji: "🟢", classe: "bg-live/15 text-live ring-live/40" },
  ASSISTIDA: { rotulo: "ASSISTIDA", emoji: "🟡", classe: "bg-gold/20 text-foreground ring-gold/50" },
  MANUAL: { rotulo: "MANUAL", emoji: "🔵", classe: "bg-primary/10 text-primary ring-primary/30" },
  VERIFICAR: { rotulo: "VERIFICAR", emoji: "⚪", classe: "bg-secondary text-muted-foreground ring-border" },
  INDISPONIVEL: { rotulo: "INDISPONÍVEL", emoji: "🔴", classe: "bg-destructive/10 text-destructive ring-destructive/30" },
};

export const PERFIS_ROTA: Record<string, string> = {
  qualquer: "Qualquer interessado",
  parte_advogado_habilitado: "Parte/advogado cadastrado no processo",
  terceiro_ou_advogado_nao_cadastrado: "Terceiro ou advogado fora do processo",
  sigiloso: "Processo sigiloso",
};

export function tipoRotaValido(t: string | null | undefined): TipoRota {
  return (t && t in TIPOS_ROTA ? t : "VERIFICAR") as TipoRota;
}

/**
 * Status exibido: enquanto a rota não for verificada com evidência oficial, é VERIFICAR.
 * AUTO_API só é AUTOMÁTICA se a integração CPN estiver homologada.
 */
export function statusRota(rota: Pick<RotaCertidao, "tipo_rota" | "status_verificacao" | "automacao_cpn"> | null) {
  if (!rota) return { categoria: "VERIFICAR" as CategoriaRota, declarada: "VERIFICAR" as CategoriaRota, verificada: false };
  const tipo = tipoRotaValido(rota.tipo_rota);
  let declarada = TIPOS_ROTA[tipo].categoria;
  if (tipo === "AUTO_API" && rota.automacao_cpn !== "homologada") declarada = "VERIFICAR";
  const verificada = rota.status_verificacao === "verificada";
  return { categoria: verificada ? declarada : ("VERIFICAR" as CategoriaRota), declarada, verificada };
}

const lista = <T,>(v: unknown, ok: (x: unknown) => x is T): T[] => (Array.isArray(v) ? v.filter(ok) : []);
export const passosDaRota = (r: RotaCertidao | null) => lista(r?.passos, (x): x is string => typeof x === "string" && x.trim().length > 0);
export const canaisDaRota = (r: RotaCertidao | null) =>
  lista(r?.canais, (x): x is CanalRota => typeof x === "object" && x !== null && typeof (x as CanalRota).rotulo === "string" && typeof (x as CanalRota).tipo === "string")
    .map((c) => ({ tipo: c.tipo, rotulo: c.rotulo, valor: typeof c.valor === "string" && c.valor.trim() ? c.valor : null }));

const norm = (v: string | null | undefined) => (v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function modalidadeValida(m: string): Modalidade {
  return (m in MODALIDADES ? m : "VERIFICAR") as Modalidade;
}

function sistemaCompativel(rotaSistema: string, ctxSistema: string) {
  const c = norm(ctxSistema);
  return rotaSistema.split(/\s+ou\s+|\//i).map(norm).filter(Boolean).some((s) => c.includes(s) || s.includes(c));
}

/** Escolhe a rota ativa mais específica. Sem rota compatível → VERIFICAR. */
export function escolherRota(rotas: RotaCertidao[], ctx: ContextoProcesso): RotaEscolhida {
  const alertas: string[] = [];
  const sigilo = ctx.nivelSigilo !== null && ctx.nivelSigilo > 0;
  const compat = rotas
    .map((r) => {
      let score = 0;
      if (r.sistema) {
        if (!ctx.sistema) score += 1;
        else if (sistemaCompativel(r.sistema, ctx.sistema)) score += 3;
        else return null;
      } else score += 2;
      if (r.grau) {
        if (!ctx.grau) score += 0;
        else if (norm(r.grau) === norm(ctx.grau)) score += 2;
        else return null;
      }
      if (r.perfil === "sigiloso") score += sigilo ? 10 : -100;
      return { r, score };
    })
    .filter((x): x is { r: RotaCertidao; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || a.r.prioridade - b.r.prioridade);
  const candidatas = compat.filter((x) => x.score > -50);

  const melhor = candidatas[0]?.r ?? null;
  const alternativas = compat.map((x) => x.r).filter((r) => r !== melhor);
  if (!melhor) {
    return { modalidade: "VERIFICAR", rota: null, alertas: ["Nenhuma rota cadastrada para este tribunal/sistema. Verificar na fonte oficial."], alternativas };
  }
  let modalidade = modalidadeValida(melhor.modalidade);
  if (melhor.sistema && !ctx.sistema) {
    alertas.push(`Rota cadastrada para ${melhor.sistema}; o sistema do processo não foi confirmado pela fonte.`);
    if (modalidade === "AUTOMATICA") modalidade = "VERIFICAR";
  }
  if (sigilo) {
    alertas.push("A fonte informa segredo de justiça: fluxo automático não se aplica.");
    if (modalidade === "AUTOMATICA" || modalidade === "SEMIAUTOMATICA") modalidade = "MANUAL";
  }
  if (melhor.status_verificacao !== "verificada") {
    alertas.push("Rota encontrada em pesquisa documental, ainda PENDENTE de verificação com evidência oficial — não está validada.");
  }
  if (melhor.automacao_cpn !== "homologada") {
    alertas.push("Execução ainda não integrada à CPN (automação não homologada): o operador executa no portal oficial.");
  }
  if (!melhor.ultima_verificacao) alertas.push("Rota sem data de verificação.");
  return { modalidade, rota: melhor, alertas, alternativas };
}

/** Instruções copiáveis da rota (somente dados cadastrados). */
export function textoInstrucoes(p: { numero: string; tribunal: string | null }, rota: RotaCertidao | null) {
  if (!rota) return `Processo: ${p.numero}\nTribunal: ${p.tribunal ?? "não identificado"}\nRota: VERIFICAR — nenhuma rota cadastrada.`;
  const st = statusRota(rota);
  const linhas = [
    `Processo: ${p.numero}`,
    `Tribunal: ${p.tribunal ?? "não identificado"}${rota.sistema ? ` · ${rota.sistema}` : ""}${rota.grau ? ` · ${rota.grau}` : ""}`,
    `Certidão: Objeto e Pé / Narratória`,
    `Rota: ${TIPOS_ROTA[tipoRotaValido(rota.tipo_rota)].rotulo} — status ${CATEGORIAS_ROTA[st.categoria].rotulo}${st.verificada ? "" : " (pendente de verificação)"}`,
  ];
  if (rota.quem_pode) linhas.push(`Quem pode solicitar: ${rota.quem_pode}`);
  const passos = passosDaRota(rota);
  if (passos.length) linhas.push("Passo a passo:", ...passos.map((s, i) => `${i + 1}. ${s}`));
  if (rota.requisitos) linhas.push(`Requisitos: ${rota.requisitos}`);
  for (const c of canaisDaRota(rota)) linhas.push(`Canal: ${c.rotulo}${c.valor ? ` — ${c.valor}` : " (endereço específico não cadastrado)"}`);
  if (rota.prazo) linhas.push(`Prazo (fonte oficial): ${rota.prazo}`);
  if (rota.custo) linhas.push(`Custo (fonte oficial): ${rota.custo}`);
  if (rota.forma_entrega) linhas.push(`Entrega: ${rota.forma_entrega}`);
  if (rota.autenticidade_url) linhas.push(`Autenticidade: ${rota.autenticidade_url}`);
  if (rota.url_fonte) linhas.push(`Fonte oficial: ${rota.url_fonte}`);
  return linhas.join("\n");
}

/** Texto copiável com a rota/instruções. */
export function textoRota(p: { numero: string; tribunal: string | null; unidade: string | null }, e: RotaEscolhida) {
  const r = e.rota;
  const linhas = [
    `Processo: ${p.numero}`,
    `Tribunal: ${p.tribunal ?? "não identificado"}`,
    `Unidade: ${p.unidade ?? "não confirmada pela fonte"}`,
    `Certidão: Objeto e Pé / Narratória`,
    `Estado da rota: ${ESTADOS_ROTA[estadoRota(e)].rotulo}`,
    `Modalidade declarada no cadastro: ${MODALIDADES[e.modalidade].rotulo}`,
  ];
  if (r) {
    linhas.push(`Método: ${r.metodo}`);
    if (r.requisitos) linhas.push(`Requisitos: ${r.requisitos}`);
    if (r.url_fonte) linhas.push(`Fonte oficial: ${r.url_fonte}`);
    if (r.url_certidao) linhas.push(`Página da certidão: ${r.url_certidao}`);
    if (r.excecoes) linhas.push(`Exceções: ${r.excecoes}`);
    if (r.ultima_verificacao) linhas.push(`Última verificação: ${r.ultima_verificacao}`);
  }
  for (const a of e.alertas) linhas.push(`Atenção: ${a}`);
  return linhas.join("\n");
}

/** Texto-base neutro de solicitação manual (o operador revisa antes de enviar). */
export function textoSolicitacao(p: { numero: string; unidade: string | null; tribunal: string | null }, rota: RotaCertidao | null) {
  if (rota?.texto_base_solicitacao) {
    return rota.texto_base_solicitacao.replaceAll("{processo}", p.numero).replaceAll("{unidade}", p.unidade ?? "");
  }
  return [
    `Ao(À) ${p.unidade ?? `Cartório/Secretaria competente — ${p.tribunal ?? ""}`}`.trim(),
    "",
    `Solicito, respeitosamente, a expedição de Certidão de Objeto e Pé (Certidão Narratória) referente ao processo nº ${p.numero}.`,
    "",
    "Coloco-me à disposição para o recolhimento de eventuais custas e para o envio de documentos complementares.",
    "",
    "Atenciosamente,",
  ].join("\n");
}


/* ---------------- Fase 2: cobertura, verificação, status de consulta ---------------- */

export interface TribunalBase { id: string; sigla: string; nome: string; uf: string | null; segmento: number }
export interface RotaCobertura { id: string; tribunal_id: string; modalidade: string; status_verificacao: string; automacao_cpn?: string }

export interface LinhaCobertura extends TribunalBase {
  /** Melhor modalidade cadastrada; VERIFICAR quando não há rota (nunca preenchida artificialmente). */
  modalidade: Modalidade;
  /** Estado apresentado ao operador: rota pendente nunca aparece como validada. */
  estado: EstadoRota;
  totalRotas: number;
  temRota: boolean;
  verificada: boolean;
}

const ORDEM: Modalidade[] = ["AUTOMATICA", "SEMIAUTOMATICA", "MANUAL", "INDISPONIVEL", "VERIFICAR"];

/** Cobertura nacional a partir do cadastro real: tribunal sem rota = VERIFICAR, sem criar registros. */
export function calcularCobertura(tribunais: TribunalBase[], rotas: RotaCobertura[]) {
  const porTrib = new Map<string, RotaCobertura[]>();
  for (const r of rotas) porTrib.set(r.tribunal_id, [...(porTrib.get(r.tribunal_id) ?? []), r]);
  const ORDEM_ESTADO: EstadoRota[] = ["ROTA_HOMOLOGADA", "ROTA_IDENTIFICADA", "MANUAL", "VERIFICAR"];
  const linhas: LinhaCobertura[] = tribunais.map((t) => {
    const rs = porTrib.get(t.id) ?? [];
    const mods = rs.map((r) => modalidadeValida(r.modalidade)).sort((a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b));
    const estados = rs
      .map((r) => estadoRota({ modalidade: modalidadeValida(r.modalidade), rota: { automacao_cpn: r.automacao_cpn ?? "nao_homologada", status_verificacao: r.status_verificacao } }))
      .sort((a, b) => ORDEM_ESTADO.indexOf(a) - ORDEM_ESTADO.indexOf(b));
    return { ...t, modalidade: mods[0] ?? "VERIFICAR", estado: estados[0] ?? "VERIFICAR", totalRotas: rs.length, temRota: rs.length > 0, verificada: rs.some((r) => r.status_verificacao === "verificada") };
  });
  const conta = (m: Modalidade) => linhas.filter((l) => l.modalidade === m).length;
  const contaE = (e: EstadoRota) => linhas.filter((l) => l.estado === e).length;
  return {
    linhas,
    resumo: {
      total: linhas.length,
      comRota: linhas.filter((l) => l.temRota).length,
      verificar: conta("VERIFICAR"),
      automatica: conta("AUTOMATICA"),
      semiautomatica: conta("SEMIAUTOMATICA"),
      manual: conta("MANUAL"),
      indisponivel: conta("INDISPONIVEL"),
      homologadas: contaE("ROTA_HOMOLOGADA"),
      identificadas: contaE("ROTA_IDENTIFICADA"),
      manuaisValidadas: contaE("MANUAL"),
      semRotaValidada: contaE("VERIFICAR"),
    },
  };
}

export function filtrarCobertura(linhas: LinhaCobertura[], termo: string) {
  const t = termo.trim().toLowerCase();
  if (!t) return linhas;
  return linhas.filter((l) => [l.sigla, l.nome, l.uf ?? ""].some((v) => v.toLowerCase().includes(t)));
}

export const STATUS_VERIFICACAO = { pendente: "Pendente", verificada: "Verificada", revisar: "Revisar" } as const;
export type StatusVerificacao = keyof typeof STATUS_VERIFICACAO;
export type AcaoRota = "verificada" | "revisar";

/** Valida a marcação e monta o patch + registro de auditoria (com evidência preservada). */
export function prepararMarcacaoRota(p: {
  acao: AcaoRota; confirmado: boolean; admin: boolean; userId: string; routeId: string;
  observacao: string | null; evidenciaAtual: string | null; urlFonte: string | null; hoje: string;
}) {
  if (!p.confirmado) throw new Error("Confirmação explícita obrigatória.");
  if (!p.admin) throw new Error("Somente administradores podem alterar o status de verificação da rota.");
  if (p.acao === "verificada" && !p.evidenciaAtual && !p.urlFonte) throw new Error("Rota sem evidência/fonte oficial não pode ser marcada como verificada.");
  const patch = {
    status_verificacao: p.acao as StatusVerificacao,
    observacao_verificacao: p.observacao,
    responsavel_id: p.userId,
    ...(p.acao === "verificada" ? { ultima_verificacao: p.hoje, verificado_por: p.userId } : {}),
  };
  const auditoria = {
    operador_id: p.userId,
    acao: p.acao === "verificada" ? "verificar_rota" : "revisar_rota",
    route_id: p.routeId,
    resultado: p.acao,
    detalhes: { observacao: p.observacao, evidencia: p.evidenciaAtual, url_fonte: p.urlFonte, data: p.hoje, confirmado: true },
  };
  return { patch, auditoria };
}

export type StatusConsulta = "confirmado" | "nao_encontrado" | "fonte_indisponivel" | "tribunal_nao_identificado";

/** Status da consulta: só "confirmado" quando a fonte oficial (DataJud) respondeu com o processo. */
export function statusConsulta(p: { tribunalIdentificado: boolean; datajudStatus: string | null }): StatusConsulta {
  if (!p.tribunalIdentificado) return "tribunal_nao_identificado";
  if (p.datajudStatus === "ok") return "confirmado";
  if (p.datajudStatus === "nao_encontrado") return "nao_encontrado";
  return "fonte_indisponivel";
}

/** Rótulos do histórico (inclui status gravados por versões anteriores). */
export const ROTULO_STATUS_CONSULTA: Record<string, string> = {
  confirmado: "DADO CONFIRMADO",
  nao_encontrado: "Não encontrado na fonte",
  fonte_indisponivel: "FONTE INDISPONÍVEL",
  tribunal_nao_identificado: "Tribunal não identificado",
  invalido: "Número inválido",
  localizado: "DADO CONFIRMADO (registro antigo)",
  nao_localizado: "Não confirmado (registro antigo)",
  erro: "FONTE INDISPONÍVEL (registro antigo)",
};

/* ---------------- Estados inequívocos (dado e rota) ---------------- */

export type EstadoDado = "DADO_CONFIRMADO" | "FONTE_INDISPONIVEL" | "NAO_ENCONTRADO" | "NAO_CONSULTADO";
export const ESTADOS_DADO: Record<EstadoDado, string> = {
  DADO_CONFIRMADO: "DADO CONFIRMADO — fonte oficial respondeu",
  FONTE_INDISPONIVEL: "FONTE INDISPONÍVEL — não foi possível confirmar agora",
  NAO_ENCONTRADO: "NÃO ENCONTRADO — a fonte oficial não retornou este processo",
  NAO_CONSULTADO: "NÃO CONSULTADO — tribunal sem fonte real disponível",
};
export function estadoDado(datajudStatus: string | null): EstadoDado {
  if (datajudStatus === "ok") return "DADO_CONFIRMADO";
  if (datajudStatus === "nao_encontrado") return "NAO_ENCONTRADO";
  if (datajudStatus === null) return "NAO_CONSULTADO";
  return "FONTE_INDISPONIVEL";
}

export interface DadosFonte {
  sistema?: string | null; grau?: string | null; orgaoJulgador?: string | null; classe?: string | null;
  assuntos?: string[]; movimentos?: { nome: string; dataHora: string | null }[]; nivelSigilo?: number | null; dataAjuizamento?: string | null;
}
/** Só repassa campos quando a fonte respondeu "ok". Qualquer outro status = nenhum dado (sem fallback). */
export function dadosConfirmados(r: { status: string; sistema?: string | null; grau?: string | null; orgaoJulgador?: string | null; classe?: string | null; assuntos?: string[]; ultimosMovimentos?: { nome: string; dataHora: string | null }[]; nivelSigilo?: number | null; dataAjuizamento?: string | null }): DadosFonte {
  if (r.status !== "ok") return {};
  return { sistema: r.sistema ?? null, grau: r.grau ?? null, orgaoJulgador: r.orgaoJulgador ?? null, classe: r.classe ?? null, assuntos: r.assuntos ?? [], movimentos: r.ultimosMovimentos ?? [], nivelSigilo: r.nivelSigilo ?? null, dataAjuizamento: r.dataAjuizamento ?? null };
}

export type EstadoRota = "ROTA_HOMOLOGADA" | "ROTA_IDENTIFICADA" | "MANUAL" | "VERIFICAR";
export const ESTADOS_ROTA: Record<EstadoRota, { rotulo: string; emoji: string; classe: string; descricao: string }> = {
  ROTA_HOMOLOGADA: { rotulo: "ROTA HOMOLOGADA", emoji: "🟢", classe: "bg-live/15 text-live ring-live/40", descricao: "A CPN executa esta rota por integração implementada e testada." },
  ROTA_IDENTIFICADA: { rotulo: "ROTA IDENTIFICADA", emoji: "🟡", classe: "bg-gold/20 text-foreground ring-gold/50", descricao: "Procedimento oficial identificado e verificado — execução ainda não integrada à CPN. O operador executa no portal oficial." },
  MANUAL: { rotulo: "MANUAL", emoji: "🔵", classe: "bg-primary/10 text-primary ring-primary/30", descricao: "Exige ação do operador junto à unidade/tribunal." },
  VERIFICAR: { rotulo: "VERIFICAR", emoji: "⚪", classe: "bg-secondary text-muted-foreground ring-border", descricao: "Sem rota validada: nenhuma rota cadastrada ou rota ainda pendente de verificação com evidência oficial." },
};

/** Estado da rota apresentado ao operador. Homologada exige verificação + integração homologada. */
export function estadoRota(e: { modalidade: Modalidade; rota: Pick<RotaCertidao, "automacao_cpn" | "status_verificacao"> | null }): EstadoRota {
  if (!e.rota || e.modalidade === "VERIFICAR" || e.modalidade === "INDISPONIVEL") return "VERIFICAR";
  if (e.rota.status_verificacao !== "verificada") return "VERIFICAR";
  if (e.modalidade === "MANUAL") return "MANUAL";
  if (e.rota.automacao_cpn === "homologada") return "ROTA_HOMOLOGADA";
  return "ROTA_IDENTIFICADA";
}
