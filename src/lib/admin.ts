import { supabase } from "@/integrations/supabase/client";
import { soDigitos } from "./pedidos.schema";

export const BUCKET_ANEXOS = "pedido-anexos";

export type Filtros = { protocolo: string; cpf: string; uf: string; status: string };

export type PedidoAdmin = {
  id: string;
  protocolo: string;
  numero_processo: string;
  nome_parte: string | null;
  quantidade: number;
  uf: string | null;
  cidade: string | null;
  cpf: string;
  email: string;
  whatsapp: string;
  observacoes: string | null;
  valor_centavos: number;
  status: string;
  created_at: string;
  pago_em: string | null;
};

const COLUNAS =
  "id, protocolo, numero_processo, nome_parte, quantidade, uf, cidade, cpf, email, whatsapp, observacoes, valor_centavos, status, created_at, pago_em";

export async function souEquipe() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: papeis } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
  return (papeis ?? []).length > 0;
}

export type HistoricoItem = {
  id: string;
  status: string;
  observacao: string | null;
  created_at: string;
  pedidos: { protocolo: string; numero_processo: string } | null;
};

export async function historicoGeral(): Promise<HistoricoItem[]> {
  const { data, error } = await supabase
    .from("pedido_andamentos")
    .select("id, status, observacao, created_at, pedidos(protocolo, numero_processo)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<HistoricoItem[]>();
  if (error) throw error;
  return data ?? [];
}

export type DocumentoItem = {
  id: string;
  tipo: string;
  nome_arquivo: string;
  caminho: string;
  tamanho_bytes: number | null;
  created_at: string;
  pedidos: { protocolo: string } | null;
};

export async function documentosGerais(): Promise<DocumentoItem[]> {
  const { data, error } = await supabase
    .from("pedido_anexos")
    .select("id, tipo, nome_arquivo, caminho, tamanho_bytes, created_at, pedidos(protocolo)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<DocumentoItem[]>();
  if (error) throw error;
  return data ?? [];
}

export async function listarPedidos(f: Filtros): Promise<PedidoAdmin[]> {
  let query = supabase
    .from("pedidos")
    .select(COLUNAS as string)
    .order("created_at", { ascending: false })
    .limit(200);

  if (f.protocolo.trim()) query = query.ilike("protocolo", `%${f.protocolo.trim().toUpperCase()}%`);
  if (soDigitos(f.cpf)) query = query.ilike("cpf", `%${soDigitos(f.cpf)}%`);
  if (f.uf) query = query.eq("uf", f.uf);
  if (f.status) query = query.eq("status", f.status);

  const { data, error } = await query.returns<PedidoAdmin[]>();
  if (error) throw error;
  return data ?? [];
}

export async function buscarPedidoAdmin(protocolo: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(COLUNAS as string)
    .eq("protocolo", protocolo.toUpperCase())
    .maybeSingle<PedidoAdmin>();
  if (error) throw error;
  return data;
}

export type Andamento = {
  id: string;
  status: string;
  observacao: string | null;
  created_at: string;
};

export async function listarAndamentos(pedidoId: string) {
  const { data, error } = await supabase
    .from("pedido_andamentos")
    .select("id, status, observacao, created_at")
    .eq("pedido_id", pedidoId)
    .order("created_at", { ascending: false })
    .returns<Andamento[]>();
  if (error) throw error;
  return data ?? [];
}

export async function registrarAndamento(input: {
  pedidoId: string;
  status: string;
  observacao: string;
}) {
  const { data: sessao } = await supabase.auth.getUser();
  const { error: erroPedido } = await supabase
    .from("pedidos")
    .update({
      status: input.status,
      ...(input.status === "pago" ? { pago_em: new Date().toISOString() } : {}),
    })
    .eq("id", input.pedidoId);
  if (erroPedido) throw erroPedido;

  const { error } = await supabase.from("pedido_andamentos").insert({
    pedido_id: input.pedidoId,
    status: input.status,
    observacao: input.observacao.trim() ? input.observacao.trim() : null,
    autor_id: sessao.user?.id ?? null,
  });
  if (error) throw error;
}

export type Anexo = {
  id: string;
  tipo: string;
  nome_arquivo: string;
  caminho: string;
  tamanho_bytes: number | null;
  created_at: string;
};

export async function listarAnexos(pedidoId: string) {
  const { data, error } = await supabase
    .from("pedido_anexos")
    .select("id, tipo, nome_arquivo, caminho, tamanho_bytes, created_at")
    .eq("pedido_id", pedidoId)
    .order("created_at", { ascending: false })
    .returns<Anexo[]>();
  if (error) throw error;
  return data ?? [];
}

export async function enviarAnexo(input: {
  pedidoId: string;
  protocolo: string;
  tipo: string;
  arquivo: File;
}) {
  const { data: sessao } = await supabase.auth.getUser();
  const nomeSeguro = input.arquivo.name.replace(/[^\w.\-]+/g, "_");
  const caminho = `${input.protocolo}/${Date.now()}-${nomeSeguro}`;

  const { error: erroUpload } = await supabase.storage
    .from(BUCKET_ANEXOS)
    .upload(caminho, input.arquivo, { contentType: input.arquivo.type || undefined });
  if (erroUpload) throw erroUpload;

  const { error } = await supabase.from("pedido_anexos").insert({
    pedido_id: input.pedidoId,
    tipo: input.tipo,
    nome_arquivo: input.arquivo.name,
    caminho,
    tamanho_bytes: input.arquivo.size,
    content_type: input.arquivo.type || null,
    autor_id: sessao.user?.id ?? null,
  });
  if (error) throw error;
}

export async function abrirAnexo(caminho: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET_ANEXOS)
    .createSignedUrl(caminho, 60 * 10);
  if (error || !data) throw error ?? new Error("Não foi possível abrir o arquivo.");
  return data.signedUrl;
}

export async function removerAnexo(anexo: { id: string; caminho: string }) {
  await supabase.storage.from(BUCKET_ANEXOS).remove([anexo.caminho]);
  const { error } = await supabase.from("pedido_anexos").delete().eq("id", anexo.id);
  if (error) throw error;
}