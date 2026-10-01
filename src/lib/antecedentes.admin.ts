/**
 * Leitura dos pedidos de Certidão de Antecedentes Criminais (Polícia Federal)
 * para a tela dedicada do painel. Usa o cliente do navegador: a RLS libera
 * apenas para a equipe.
 */
import { supabase } from "@/integrations/supabase/client";

export const TIPO_ANTECEDENTES = "antecedentes_pf";

export type EmissaoAntecedentes = {
  status: string;
  tentativas: number;
  certidao_numero: string | null;
  certidao_codigo: string | null;
  emissao_datahora: string | null;
  validade_data: string | null;
  mensagem: string | null;
  site_receipt: string | null;
  negativa: boolean | null;
  erro: string | null;
  emitida_em: string | null;
  email_enviado_em: string | null;
  whatsapp_enviado_em: string | null;
  proxima_tentativa_em: string | null;
};

export type PedidoAntecedentesAdmin = {
  id: string;
  protocolo: string;
  nome_parte: string | null;
  cpf: string;
  email: string;
  whatsapp: string;
  status: string;
  valor_centavos: number;
  created_at: string;
  pago_em: string | null;
  ant_nome_mae: string | null;
  ant_nome_pai: string | null;
  ant_uf_nascimento: string | null;
  ant_nascimento: string | null;
  /** PostgREST devolve objeto quando a relação é 1-para-1 e lista quando não é. */
  emissoes_antecedentes: EmissaoAntecedentes | EmissaoAntecedentes[] | null;
};

const COLUNAS =
  "id, protocolo, nome_parte, cpf, email, whatsapp, status, valor_centavos, created_at, pago_em, " +
  "ant_nome_mae, ant_nome_pai, ant_uf_nascimento, ant_nascimento, " +
  "emissoes_antecedentes(status, tentativas, certidao_numero, certidao_codigo, emissao_datahora, " +
  "validade_data, mensagem, site_receipt, negativa, erro, emitida_em, email_enviado_em, " +
  "whatsapp_enviado_em, proxima_tentativa_em)";

/** Pedidos de antecedentes criminais, mais recentes primeiro. */
export async function listarPedidosAntecedentes(
  busca = "",
): Promise<PedidoAntecedentesAdmin[]> {
  let query = supabase
    .from("pedidos")
    .select(COLUNAS)
    .eq("tipo", TIPO_ANTECEDENTES)
    .order("created_at", { ascending: false })
    .limit(200);

  const termo = busca.trim();
  if (termo) {
    const t = termo.replace(/[%,]/g, "");
    query = query.or(
      `protocolo.ilike.%${t.toUpperCase()}%,nome_parte.ilike.%${t}%,email.ilike.%${t}%,cpf.ilike.%${t.replace(/\D/g, "")}%`,
    );
  }

  const { data, error } = await query.returns<PedidoAntecedentesAdmin[]>();
  if (error) throw error;
  return data ?? [];
}

/** Dados da emissão (a relação sempre traz no máximo uma linha). */
export function emissaoDoPedido(p: PedidoAntecedentesAdmin): EmissaoAntecedentes | null {
  return p.emissoes_antecedentes?.[0] ?? null;
}

export const ROTULO_EMISSAO: Record<string, { texto: string; cor: string }> = {
  pendente: { texto: "Aguardando emissão", cor: "bg-secondary text-foreground" },
  processando: { texto: "Emitindo agora", cor: "bg-secondary text-foreground" },
  emitida: { texto: "Certidão emitida", cor: "bg-accent/15 text-accent" },
  falhou: { texto: "Falhou — nova tentativa programada", cor: "bg-destructive/10 text-destructive" },
  falhou_definitivo: { texto: "Falhou — atendimento manual", cor: "bg-destructive/10 text-destructive" },
};
