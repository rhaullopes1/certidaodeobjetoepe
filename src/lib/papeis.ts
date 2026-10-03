import { supabase } from "@/integrations/supabase/client";

/** Papéis com acesso ao back office (/admin). operador_certidao NÃO entra aqui. */
export const PAPEIS_ADMINISTRATIVOS = ["admin", "equipe"] as const;
export const PAPEL_OPERADOR = "operador_certidao" as const;

export function ehAdministrativo(papeis: readonly string[]) {
  return papeis.some((p) => (PAPEIS_ADMINISTRATIVOS as readonly string[]).includes(p));
}

export function ehOperador(papeis: readonly string[]) {
  return papeis.includes(PAPEL_OPERADOR);
}

/** Destino após login: equipe → fluxo administrativo atual; operador → /operacao. */
export function destinoPosLogin(papeis: readonly string[]): "/minha-conta" | "/operacao" {
  if (ehAdministrativo(papeis)) return "/minha-conta";
  if (ehOperador(papeis)) return "/operacao";
  return "/minha-conta";
}

export async function meusPapeis(): Promise<string[]> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return [];
  const { data: papeis } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
  return (papeis ?? []).map((p) => p.role as string);
}

export const ETAPAS_OPERACAO = [
  { valor: "atribuido", rotulo: "Recebido" },
  { valor: "em_andamento", rotulo: "Em andamento" },
  { valor: "aguardando_tribunal", rotulo: "Aguardando tribunal" },
  { valor: "documento_recebido", rotulo: "Documento recebido" },
  { valor: "concluido", rotulo: "Concluído / Aguardando validação" },
  { valor: "devolvido", rotulo: "Devolvido" },
] as const;

export type EtapaOperacao = (typeof ETAPAS_OPERACAO)[number]["valor"];

export function rotuloEtapa(v: string | null | undefined) {
  if (v === "validado") return "Validado pela administração";
  if (v === "pendencia") return "Pendência registrada";
  if (v === "pendencia_resolvida") return "Pendência resolvida";
  return ETAPAS_OPERACAO.find((e) => e.valor === v)?.rotulo ?? v ?? "—";
}

/** Atribuição ativa = não devolvida e ainda não validada pela administração. */
export function atribuicaoAtiva(a: { status_operacao: string; validado_em: string | null }) {
  return a.status_operacao !== "devolvido" && !a.validado_em;
}

/** Pedido pode ser enviado à operação: pago, não encerrado e sem atribuição ativa. */
export const STATUS_ENVIAVEIS_OPERACAO = ["pago", "em_analise", "protocolado"] as const;
export function podeEnviarParaOperacao(
  status: string,
  atribuicoes: { status_operacao: string; validado_em: string | null }[],
) {
  return (
    (STATUS_ENVIAVEIS_OPERACAO as readonly string[]).includes(status) &&
    !atribuicoes.some(atribuicaoAtiva)
  );
}

/** Visual da operação nas listagens: estado de cada atribuição ainda não validada. */
export type EstadoVisualOperacao = "em_operacao" | "aguardando_validacao" | "devolvida";

export const CLASSE_CARD_OPERACAO: Record<EstadoVisualOperacao, string> = {
  em_operacao: "card-operacao-ativa",
  aguardando_validacao: "card-operacao-aguardando",
  devolvida: "card-operacao-devolvida",
};

export const CLASSE_SELO_OPERACAO: Record<EstadoVisualOperacao, string> = {
  em_operacao: "bg-primary text-primary-foreground",
  aguardando_validacao: "bg-gold text-navy",
  devolvida: "bg-destructive/10 text-destructive border border-destructive/25",
};

export type VisualOperacao = {
  estado: EstadoVisualOperacao;
  etiqueta: string;
  etapa: string;
};

/** Mapeia uma atribuição (status + validação) para o estado visual do card; null = card normal. */
export function visualOperacao(
  a: { status_operacao: string; validado_em: string | null } | undefined | null,
): VisualOperacao | null {
  if (!a || a.validado_em) return null;
  const etapa = rotuloEtapa(a.status_operacao);
  if (a.status_operacao === "devolvido") {
    return { estado: "devolvida", etiqueta: "Devolvida pela operação", etapa };
  }
  if (a.status_operacao === "concluido") {
    return { estado: "aguardando_validacao", etiqueta: "Aguardando validação", etapa };
  }
  return { estado: "em_operacao", etiqueta: "Em operação", etapa };
}

export type EtapaOperadorAcao = "em_andamento" | "aguardando_tribunal" | "documento_recebido" | "concluido";

/**
 * Etapas que o próprio operador pode marcar. Espelha a regra do banco
 * (operador_atualizar_etapa): validação continua exclusiva da administração.
 */
export function proximasEtapasOperador(atual: string): { valor: EtapaOperadorAcao; rotulo: string }[] {
  switch (atual) {
    case "atribuido":
      return [{ valor: "em_andamento", rotulo: "Iniciar operação" }];
    case "em_andamento":
      return [
        { valor: "concluido", rotulo: "Concluir operação" },
        { valor: "aguardando_tribunal", rotulo: "Registrar aguardando tribunal" },
        { valor: "documento_recebido", rotulo: "Registrar documento recebido" },
      ];
    case "aguardando_tribunal":
      return [
        { valor: "documento_recebido", rotulo: "Registrar documento recebido" },
        { valor: "em_andamento", rotulo: "Voltar para em andamento" },
      ];
    case "documento_recebido":
      return [{ valor: "concluido", rotulo: "Concluir operação" }];
    default:
      return [];
  }
}

/* ---------------- Cockpit operacional (sem qualquer dado financeiro) ---------------- */

export const MOTIVOS_PENDENCIA = [
  { valor: "documento_faltante", rotulo: "Documento faltante" },
  { valor: "processo_indisponivel", rotulo: "Processo/consulta indisponível" },
  { valor: "segredo_justica", rotulo: "Segredo de justiça" },
  { valor: "tribunal_indisponivel", rotulo: "Tribunal indisponível" },
  { valor: "dados_inconsistentes", rotulo: "Dados inconsistentes" },
  { valor: "aguardando_resposta_tribunal", rotulo: "Aguardando resposta do tribunal" },
  { valor: "outro", rotulo: "Outro" },
] as const;
export type MotivoPendencia = (typeof MOTIVOS_PENDENCIA)[number]["valor"];
export function rotuloPendencia(v: string | null | undefined) {
  return MOTIVOS_PENDENCIA.find((m) => m.valor === v)?.rotulo ?? v ?? "";
}

/** Itens marcados manualmente pelo operador. "PDF anexado" e "Pronta para conclusão" são derivados. */
export const CHECKLIST_MANUAL = [
  { chave: "processo_identificado", rotulo: "Processo identificado" },
  { chave: "tribunal_identificado", rotulo: "Tribunal identificado" },
  { chave: "acesso_realizado", rotulo: "Acesso ao processo realizado" },
  { chave: "informacoes_conferidas", rotulo: "Informações conferidas" },
  { chave: "certidao_solicitada", rotulo: "Certidão solicitada" },
  { chave: "certidao_recebida", rotulo: "Certidão recebida" },
  { chave: "pdf_conferido", rotulo: "PDF conferido" },
] as const;
export type ChaveChecklist = (typeof CHECKLIST_MANUAL)[number]["chave"];

/** Faixas de idade (dias desde a atribuição). Só indicador visual — não é SLA. Ajuste aqui. */
export const FAIXAS_IDADE_OPERACAO = { atencao: 2, critica: 4 } as const;
export type NivelIdade = "normal" | "atencao" | "critica";

export function diasDesde(iso: string, agora: Date = new Date()) {
  return Math.max(0, Math.floor((agora.getTime() - new Date(iso).getTime()) / 86_400_000));
}
export function nivelIdade(dias: number): NivelIdade {
  if (dias >= FAIXAS_IDADE_OPERACAO.critica) return "critica";
  if (dias >= FAIXAS_IDADE_OPERACAO.atencao) return "atencao";
  return "normal";
}

type ItemFila = { status_operacao: string; atribuido_em: string; pendencia_motivo?: string | null; pdfs?: number | null };

/** Próxima ação principal sugerida na fila/detalhe; nunca oferece ação inválida para a etapa. */
export function proximaAcaoOperador(t: ItemFila): string {
  if (t.status_operacao === "concluido") return "Aguardando validação";
  if (t.status_operacao === "devolvido") return "Recolhida pela administração";
  if (t.pendencia_motivo) return "Resolver pendência";
  if (t.status_operacao === "atribuido") return "Iniciar operação";
  if (t.status_operacao === "aguardando_tribunal") return "Registrar documento recebido";
  if ((t.pdfs ?? 0) < MIN_PDFS_OPERADOR) return "Anexar certidão";
  return "Concluir operação";
}

/** Pontuação de atenção: pendência > idade crítica > recebido parado > idade de atenção. Concluídas por último. */
export function pesoAtencao(t: ItemFila, agora: Date = new Date()) {
  if (t.status_operacao === "concluido") return -1;
  const nivel = nivelIdade(diasDesde(t.atribuido_em, agora));
  let peso = 0;
  if (t.pendencia_motivo) peso += 100;
  if (nivel === "critica") peso += 50;
  if (nivel === "atencao") peso += 20;
  if (t.status_operacao === "atribuido") peso += 10;
  return peso;
}
export function precisaAtencao(t: ItemFila, agora: Date = new Date()) {
  return t.status_operacao !== "concluido" && (Boolean(t.pendencia_motivo) || nivelIdade(diasDesde(t.atribuido_em, agora)) !== "normal");
}
export function ordenarFilaOperador<T extends ItemFila>(lista: T[], agora: Date = new Date()): T[] {
  return [...lista].sort(
    (a, b) => pesoAtencao(b, agora) - pesoAtencao(a, agora) || new Date(a.atribuido_em).getTime() - new Date(b.atribuido_em).getTime(),
  );
}

/** Duração legível entre duas datas (ex.: "2d 4h"). */
export function duracao(inicio: string | null, fim: string | null) {
  if (!inicio || !fim) return null;
  const h = Math.max(0, Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 3_600_000));
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`;
}
export function mediana(nums: number[]) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** PDFs da certidão exigidos na conclusão pelo operador. */
export const MIN_PDFS_OPERADOR = 1;
export const MAX_PDFS_OPERADOR = 3;

export function validarPdfOperador(
  arquivo: { name: string; type: string },
  jaEnviados: number,
): string | null {
  if (jaEnviados >= MAX_PDFS_OPERADOR) return `Limite de ${MAX_PDFS_OPERADOR} PDFs por operação atingido.`;
  if (arquivo.type !== "application/pdf" || !/\.pdf$/i.test(arquivo.name)) return "Apenas arquivos PDF são aceitos.";
  return null;
}

export function podeConcluirComPdfs(qtd: number): boolean {
  return qtd >= MIN_PDFS_OPERADOR && qtd <= MAX_PDFS_OPERADOR;
}
