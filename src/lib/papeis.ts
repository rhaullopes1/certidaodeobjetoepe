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
  { valor: "atribuido", rotulo: "Atribuído" },
  { valor: "em_andamento", rotulo: "Em andamento" },
  { valor: "aguardando_tribunal", rotulo: "Aguardando tribunal" },
  { valor: "documento_recebido", rotulo: "Documento recebido" },
  { valor: "concluido", rotulo: "Concluído" },
  { valor: "devolvido", rotulo: "Devolvido" },
] as const;

export type EtapaOperacao = (typeof ETAPAS_OPERACAO)[number]["valor"];

export function rotuloEtapa(v: string | null | undefined) {
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
