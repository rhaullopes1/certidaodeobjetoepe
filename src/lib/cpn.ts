/**
 * CPN — Certidão Processual Nacional (uso interno do operador).
 * Motor de rotas puro e determinístico: escolhe a rota cadastrada (dados) para um processo.
 * Nunca presume que PJe/eproc = emissão automática: só vale o que está cadastrado/verificado.
 */
import { digitoVerificadorNup, formatarNup } from "./cnj";

export type Modalidade = "AUTOMATICA" | "SEMIAUTOMATICA" | "MANUAL" | "INDISPONIVEL" | "VERIFICAR";

export const MODALIDADES: Record<Modalidade, { rotulo: string; emoji: string; classe: string; descricao: string }> = {
  AUTOMATICA: { rotulo: "AUTOMÁTICA", emoji: "🟢", classe: "bg-live/15 text-live ring-live/40", descricao: "Emissão automática pelo tribunal (fluxo elegível)." },
  SEMIAUTOMATICA: { rotulo: "SEMIAUTOMÁTICA", emoji: "🟡", classe: "bg-gold/20 text-foreground ring-gold/50", descricao: "Portal online; exige ação do operador." },
  MANUAL: { rotulo: "MANUAL", emoji: "🔵", classe: "bg-primary/10 text-primary ring-primary/30", descricao: "Solicitação manual à unidade/tribunal." },
  INDISPONIVEL: { rotulo: "INDISPONÍVEL", emoji: "🔴", classe: "bg-destructive/10 text-destructive ring-destructive/30", descricao: "Rota indisponível no momento." },
  VERIFICAR: { rotulo: "VERIFICAR", emoji: "⚪", classe: "bg-secondary text-muted-foreground ring-border", descricao: "Sem rota cadastrada/verificada para este contexto." },
};

export const STATUS_OPERACAO = {
  aguardando: "Aguardando",
  solicitado: "Solicitado",
  em_analise: "Em análise",
  recebido: "Recebido",
  entregue: "Entregue",
  sem_resposta: "Sem resposta",
} as const;
export type StatusOperacao = keyof typeof STATUS_OPERACAO;

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
}

const norm = (v: string | null | undefined) => (v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function modalidadeValida(m: string): Modalidade {
  return (m in MODALIDADES ? m : "VERIFICAR") as Modalidade;
}

/** Escolhe a rota ativa mais específica. Sem rota compatível → VERIFICAR. */
export function escolherRota(rotas: RotaCertidao[], ctx: ContextoProcesso): RotaEscolhida {
  const alertas: string[] = [];
  const candidatas = rotas
    .map((r) => {
      let score = 0;
      if (r.sistema) {
        if (!ctx.sistema) score += 1;
        else if (norm(ctx.sistema).includes(norm(r.sistema))) score += 3;
        else return null;
      } else score += 2;
      if (r.grau) {
        if (!ctx.grau) score += 0;
        else if (norm(r.grau) === norm(ctx.grau)) score += 2;
        else return null;
      }
      return { r, score };
    })
    .filter((x): x is { r: RotaCertidao; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || a.r.prioridade - b.r.prioridade);

  const melhor = candidatas[0]?.r ?? null;
  if (!melhor) {
    return { modalidade: "VERIFICAR", rota: null, alertas: ["Nenhuma rota cadastrada para este tribunal/sistema. Verificar na fonte oficial."] };
  }
  let modalidade = modalidadeValida(melhor.modalidade);
  if (melhor.sistema && !ctx.sistema) {
    alertas.push(`Rota cadastrada para ${melhor.sistema}; o sistema do processo não foi confirmado pela fonte.`);
    if (modalidade === "AUTOMATICA") modalidade = "VERIFICAR";
  }
  if (ctx.nivelSigilo !== null && ctx.nivelSigilo > 0) {
    alertas.push("A fonte informa segredo de justiça: fluxo automático não se aplica.");
    if (modalidade === "AUTOMATICA" || modalidade === "SEMIAUTOMATICA") modalidade = "MANUAL";
  }
  if (melhor.automacao_cpn !== "homologada") {
    alertas.push("Automação pela CPN não homologada: a emissão é feita no portal do tribunal pelo operador.");
  }
  if (!melhor.ultima_verificacao) alertas.push("Rota sem data de verificação.");
  return { modalidade, rota: melhor, alertas };
}

/** Texto copiável com a rota/instruções. */
export function textoRota(p: { numero: string; tribunal: string | null; unidade: string | null }, e: RotaEscolhida) {
  const r = e.rota;
  const linhas = [
    `Processo: ${p.numero}`,
    `Tribunal: ${p.tribunal ?? "não identificado"}`,
    `Unidade: ${p.unidade ?? "não confirmada pela fonte"}`,
    `Certidão: Objeto e Pé / Narratória`,
    `Modalidade: ${MODALIDADES[e.modalidade].rotulo}`,
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

function nupValido(numero: string, ano: string, j: string, tr: string, origem: string) {
  const dv = digitoVerificadorNup(numero, ano, j, tr, origem);
  return formatarNup(`${numero}${dv}${ano}${j}${tr}${origem}`);
}

/** Casos DEMO — números fictícios com dígito válido; nunca consultam fontes reais. */
export const CASOS_DEMO = [
  { numero: nupValido("0000001", "2025", "8", "24", "0023"), titulo: "TJSC · eproc", dados: { sistema: "eproc", grau: "G1", orgaoJulgador: "DEMO — Vara Cível", classe: "Procedimento Comum Cível", assuntos: ["DEMO — Indenização"], nivelSigilo: 0 } },
  { numero: nupValido("0000002", "2025", "8", "26", "0100"), titulo: "TJSP · eproc", dados: { sistema: "eproc", grau: "G1", orgaoJulgador: "DEMO — Vara Criminal", classe: "Ação Penal", assuntos: ["DEMO — Furto"], nivelSigilo: 0 } },
  { numero: nupValido("0000003", "2024", "4", "03", "6100"), titulo: "TRF3 · PJe", dados: { sistema: "PJe", grau: "G1", orgaoJulgador: "DEMO — Vara Federal", classe: "Execução Fiscal", assuntos: ["DEMO — Tributário"], nivelSigilo: 0 } },
  { numero: nupValido("0000004", "2024", "8", "11", "0041"), titulo: "TJMT · PJe com sigilo", dados: { sistema: "PJe", grau: "G1", orgaoJulgador: "DEMO — Vara de Família", classe: "Divórcio", assuntos: ["DEMO — Família"], nivelSigilo: 1 } },
  { numero: nupValido("0000005", "2023", "8", "05", "0001"), titulo: "TJBA · sem rota", dados: { sistema: "PJe", grau: "G1", orgaoJulgador: "DEMO — Vara Cível", classe: "Monitória", assuntos: ["DEMO — Cobrança"], nivelSigilo: 0 } },
] as const;

/* ---------------- Fase 2: cobertura, verificação, status de consulta ---------------- */

export interface TribunalBase { id: string; sigla: string; nome: string; uf: string | null; segmento: number }
export interface RotaCobertura { id: string; tribunal_id: string; modalidade: string; status_verificacao: string }

export interface LinhaCobertura extends TribunalBase {
  /** Melhor modalidade cadastrada; VERIFICAR quando não há rota (nunca preenchida artificialmente). */
  modalidade: Modalidade;
  totalRotas: number;
  temRota: boolean;
  verificada: boolean;
}

const ORDEM: Modalidade[] = ["AUTOMATICA", "SEMIAUTOMATICA", "MANUAL", "INDISPONIVEL", "VERIFICAR"];

/** Cobertura nacional a partir do cadastro real: tribunal sem rota = VERIFICAR, sem criar registros. */
export function calcularCobertura(tribunais: TribunalBase[], rotas: RotaCobertura[]) {
  const porTrib = new Map<string, RotaCobertura[]>();
  for (const r of rotas) porTrib.set(r.tribunal_id, [...(porTrib.get(r.tribunal_id) ?? []), r]);
  const linhas: LinhaCobertura[] = tribunais.map((t) => {
    const rs = porTrib.get(t.id) ?? [];
    const mods = rs.map((r) => modalidadeValida(r.modalidade)).sort((a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b));
    return { ...t, modalidade: mods[0] ?? "VERIFICAR", totalRotas: rs.length, temRota: rs.length > 0, verificada: rs.some((r) => r.status_verificacao === "verificada") };
  });
  const conta = (m: Modalidade) => linhas.filter((l) => l.modalidade === m).length;
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

export type StatusConsulta = "localizado" | "nao_localizado" | "tribunal_nao_identificado" | "erro";

/** Status da consulta: só "localizado" com DataJud ok (ou DEMO). Falha do DataJud nunca vira localizado. */
export function statusConsulta(p: { tribunalIdentificado: boolean; demo: boolean; datajudStatus: string | null }): StatusConsulta {
  if (!p.tribunalIdentificado) return "tribunal_nao_identificado";
  if (p.demo || p.datajudStatus === "ok") return "localizado";
  if (p.datajudStatus === "indisponivel" || p.datajudStatus === "limite_requisicoes") return "erro";
  return "nao_localizado";
}
