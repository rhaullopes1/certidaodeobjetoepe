import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
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
  certidoes: { numeroProcesso: string; nomeParte: string; cpf: string; observacoes?: string | null }[] | null;
  valor_centavos: number;
  status: string;
  created_at: string;
  pago_em: string | null;
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
  processo_enriquecido?: boolean | null;
  processo_enriquecido_em?: string | null;
  processo_fonte?: string | null;
  processo_confianca?: string | null;
  processo_dados?: Record<string, unknown> | null;
  /** Calculado no cliente: repete processo + CPF de outro pedido da lista. */
  duplicado?: boolean;
  /** Calculado no cliente: criado nas últimas 24 horas. */
  novo?: boolean;
};

const COLUNAS =
  "id, protocolo, numero_processo, nome_parte, quantidade, uf, cidade, cpf, email, whatsapp, observacoes, certidoes, valor_centavos, status, created_at, pago_em, tribunal_sigla, tribunal_nome, segmento_judiciario, uf_processo, cidade_processo, comarca_processo, foro, codigo_origem_cnj, vara, unidade_judiciaria, sistema_processual, processo_enriquecido, processo_enriquecido_em, processo_fonte, processo_confianca, processo_dados";

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

  // Exibe como "expirado" os pedidos sem pagamento há mais de 7 dias.
  // A gravação no banco acontece no servidor (leitura pública/webhook).
  const lista = (data ?? []).map(comStatusExpirado);

  // Marca pedidos que repetem processo + CPF (possível duplicidade).
  const contagem = new Map<string, number>();
  for (const p of lista) {
    const chave = chaveDuplicidade(p);
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }

  return lista.map((p) => ({
    ...p,
    duplicado: (contagem.get(chaveDuplicidade(p)) ?? 0) > 1,
    novo: ehNovo(p.created_at),
  }));
}

export function chaveDuplicidade(p: { numero_processo: string; cpf: string }) {
  return `${soDigitos(p.numero_processo)}|${soDigitos(p.cpf)}`;
}

/** Pedido criado nas últimas 24 horas. */
export function ehNovo(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

const DIAS_PARA_EXPIRAR = 7;

function comStatusExpirado<T extends { status: string; created_at: string }>(p: T): T {
  if (p.status !== "aguardando_pagamento") return p;
  const criadoEm = new Date(p.created_at).getTime();
  if (Date.now() - criadoEm < DIAS_PARA_EXPIRAR * 24 * 60 * 60 * 1000) return p;
  return { ...p, status: "expirado" };
}

/** Outros pedidos com o mesmo processo + CPF (exceto o próprio protocolo). */
export async function pedidosRelacionados(p: {
  protocolo: string;
  numero_processo: string;
  cpf: string;
}): Promise<{ protocolo: string; status: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("protocolo, status, created_at, numero_processo, cpf")
    .eq("cpf", p.cpf)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? [])
    .filter(
      (r) =>
        r.protocolo !== p.protocolo &&
        chaveDuplicidade(r) === chaveDuplicidade(p),
    )
    .map((r) => ({ protocolo: r.protocolo, status: r.status, created_at: r.created_at }));
}

export async function buscarPedidoAdmin(protocolo: string) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(COLUNAS as string)
    .eq("protocolo", protocolo.toUpperCase())
    .maybeSingle<PedidoAdmin>();
  if (error) throw error;
  if (!data) return data;
  return comStatusExpirado(data);
}

export type Andamento = {
  id: string;
  status: string;
  observacao: string | null;
  observacao_interna: string | null;
  comarca_contato_id: string | null;
  created_at: string;
};

export async function listarAndamentos(pedidoId: string) {
  const { data, error } = await supabase
    .from("pedido_andamentos")
    .select("id, status, observacao, observacao_interna, comarca_contato_id, created_at")
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
  observacaoInterna?: string;
  comarcaContatoId?: string | null;
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

  const interna = (input.observacaoInterna ?? "").trim();
  const { error } = await supabase.from("pedido_andamentos").insert({
    pedido_id: input.pedidoId,
    status: input.status,
    observacao: input.observacao.trim() ? input.observacao.trim() : null,
    observacao_interna: interna ? interna : null,
    comarca_contato_id: input.comarcaContatoId ?? null,
    autor_id: sessao.user?.id ?? null,
  });
  if (error) throw error;

  // Baixa manual de um pedido de antecedentes também emite a certidão.
  if (input.status === "pago") {
    try {
      const { dispararEmissaoAntecedentes } = await import("./antecedentes.admin.functions");
      await dispararEmissaoAntecedentes({ data: { pedidoId: input.pedidoId } });
    } catch (e) {
      console.error("Falha ao disparar emissão de antecedentes", e);
    }
  }
}

/** Contato de comarca acumulado pela equipe (uso exclusivamente interno). */
export type ComarcaContato = {
  id: string;
  uf: string | null;
  tribunal: string | null;
  comarca: string;
  vara_cartorio: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  balcao_virtual_url: string | null;
  observacoes: string | null;
  foro: string | null;
  codigo_origem_cnj: string | null;
  unidade_judiciaria: string | null;
  endereco: string | null;
  cep: string | null;
  responsavel_nome: string | null;
  responsavel_setor: string | null;
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
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

/** Campos de texto opcionais da unidade (usados no formulário e na gravação). */
export const CAMPOS_TEXTO_UNIDADE = [
  "uf", "tribunal", "vara_cartorio", "telefone", "whatsapp", "email", "balcao_virtual_url",
  "observacoes", "foro", "codigo_origem_cnj", "unidade_judiciaria", "endereco", "cep",
  "responsavel_nome", "responsavel_setor", "canal_solicitacao_tipo", "canal_solicitacao_url",
  "canal_solicitacao_email", "canal_solicitacao_telefone", "instrucoes_solicitacao",
  "documentos_exigidos", "taxa_info", "prazo_info", "fonte_url", "fonte_tipo", "fonte_atualizada_em",
] as const;

/** Dados operacionais que exigem fonte informada. */
const CAMPOS_OPERACIONAIS = [
  "telefone", "whatsapp", "email", "balcao_virtual_url", "endereco", "responsavel_nome",
  "canal_solicitacao_url", "canal_solicitacao_email", "canal_solicitacao_telefone",
  "instrucoes_solicitacao", "documentos_exigidos", "taxa_info", "prazo_info",
] as const;

export const TIPOS_FONTE = [
  "Site oficial do tribunal",
  "Diário oficial",
  "Portaria/ato oficial",
  "Contato direto com a unidade",
  "Resposta oficial por e-mail",
] as const;

export const TIPOS_CANAL = [
  "portal", "formulario", "email", "balcao_virtual", "telefone", "presencial",
] as const;

/** Retorna mensagem de erro se houver dado operacional sem fonte. */
export function validarFonteUnidade(i: Partial<Record<string, string | null | boolean | undefined>>) {
  const temOperacional = CAMPOS_OPERACIONAIS.some((c) => String(i[c] ?? "").trim() !== "");
  if (!temOperacional) return null;
  if (!String(i["fonte_tipo"] ?? "").trim()) return "Informe o tipo da fonte dos dados operacionais.";
  if (!String(i["fonte_atualizada_em"] ?? "").trim()) return "Informe a data de atualização da fonte.";
  const tipo = String(i["fonte_tipo"]);
  if (/site|di[aá]rio|portaria/i.test(tipo) && !/^https?:\/\//i.test(String(i["fonte_url"] ?? "")))
    return "Informe o link da fonte oficial (https://...).";
  for (const c of ["telefone", "whatsapp", "canal_solicitacao_telefone"]) {
    const v = String(i[c] ?? "").replace(/\D/g, "");
    if (v && (v.length < 8 || v.length > 13)) return "Telefone/WhatsApp inválido (use DDD + número).";
  }
  for (const c of ["email", "canal_solicitacao_email"]) {
    const v = String(i[c] ?? "").trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "E-mail inválido.";
  }
  for (const c of ["balcao_virtual_url", "canal_solicitacao_url", "fonte_url"]) {
    const v = String(i[c] ?? "").trim();
    if (v && !/^https:\/\/\S+$/i.test(v)) return "Os links precisam começar com https://";
  }
  return null;
}

const COLUNAS_COMARCA =
  "id, uf, tribunal, comarca, vara_cartorio, telefone, whatsapp, email, balcao_virtual_url, observacoes, foro, codigo_origem_cnj, unidade_judiciaria, endereco, cep, responsavel_nome, responsavel_setor, canal_solicitacao_tipo, canal_solicitacao_url, canal_solicitacao_email, canal_solicitacao_telefone, instrucoes_solicitacao, documentos_exigidos, taxa_info, prazo_info, fonte_url, fonte_tipo, fonte_atualizada_em, ativo, created_at, updated_at";

export async function listarComarcas(busca = ""): Promise<ComarcaContato[]> {
  let query = supabase
    .from("comarcas_contatos")
    .select(COLUNAS_COMARCA)
    .order("comarca", { ascending: true })
    .limit(500);

  const termo = busca.trim();
  if (termo) {
    query = query.or(
      ["comarca", "tribunal", "vara_cartorio", "telefone", "whatsapp", "email", "foro", "codigo_origem_cnj", "unidade_judiciaria"]
        .map((c) => `${c}.ilike.%${termo}%`)
        .join(","),
    );
  }

  const { data, error } = await query.returns<ComarcaContato[]>();
  if (error) throw error;
  return data ?? [];
}

export type ComarcaContatoInput = Partial<Omit<ComarcaContato, "id" | "created_at" | "updated_at">> & {
  id?: string;
  comarca: string;
};

/** Candidatos de unidade para o pedido (usa apenas dados persistidos, sem consulta externa). */
export async function unidadesParaPedido(p: {
  comarca_processo?: string | null;
  codigo_origem_cnj?: string | null;
  tribunal_sigla?: string | null;
}): Promise<ComarcaContato[]> {
  const filtros: string[] = [];
  if (p.comarca_processo) filtros.push(`comarca.ilike.${p.comarca_processo.replace(/[,()]/g, " ")}`);
  if (p.codigo_origem_cnj && p.tribunal_sigla)
    filtros.push(`and(codigo_origem_cnj.eq.${p.codigo_origem_cnj},tribunal.ilike.${p.tribunal_sigla})`);
  if (filtros.length === 0) return [];
  const { data, error } = await supabase
    .from("comarcas_contatos")
    .select(COLUNAS_COMARCA)
    .or(filtros.join(","))
    .limit(100)
    .returns<ComarcaContato[]>();
  if (error) throw error;
  return data ?? [];
}

/** URL oficial de consulta processual cadastrada para o tribunal (ou null). */
export async function urlConsultaTribunal(sigla: string | null | undefined) {
  if (!sigla) return null;
  const { data } = await supabase
    .from("cnj_tribunais")
    .select("consulta_processual_url")
    .eq("sigla", sigla)
    .maybeSingle();
  return data?.consulta_processual_url ?? null;
}

export type CanaisTribunal = {
  sigla: string;
  consulta_processual_url: string | null;
  consulta_processual_fonte: string | null;
  consulta_processual_verificada_em: string | null;
  balcao_virtual_url: string | null;
  balcao_virtual_fonte: string | null;
  balcao_virtual_verificada_em: string | null;
  certidoes_url: string | null;
  certidoes_tipo: "geral" | "especifica_objeto_pe" | "objeto_pe_via_unidade" | null;
  certidoes_email: string | null;
  certidoes_telefone: string | null;
  certidoes_instrucoes: string | null;
  certidoes_fonte_normativa_url: string | null;
  certidoes_fonte: string | null;
  certidoes_verificada_em: string | null;
};

/** Canais gerais oficiais do tribunal (último nível da prioridade de contato). */
export async function canaisTribunal(sigla: string | null | undefined) {
  if (!sigla) return null;
  const { data } = await supabase
    .from("cnj_tribunais")
    .select(
      "sigla, consulta_processual_url, consulta_processual_fonte, consulta_processual_verificada_em, balcao_virtual_url, balcao_virtual_fonte, balcao_virtual_verificada_em, certidoes_url, certidoes_tipo, certidoes_fonte, certidoes_verificada_em, certidoes_email, certidoes_telefone, certidoes_instrucoes, certidoes_fonte_normativa_url",
    )
    .eq("sigla", sigla)
    .maybeSingle();
  return (data as CanaisTribunal | null) ?? null;
}

/**
 * Dados para "Onde solicitar" na fila: todas as unidades ativas cadastradas e os
 * canais dos tribunais presentes. Só leitura do cadastro; nenhuma consulta externa.
 */
export async function dadosCanaisFila(siglas: string[]) {
  const unicas = [...new Set(siglas.filter(Boolean))];
  const [unid, trib] = await Promise.all([
    supabase.from("comarcas_contatos").select(COLUNAS_COMARCA).eq("ativo", true).limit(1000).returns<ComarcaContato[]>(),
    unicas.length
      ? supabase
          .from("cnj_tribunais")
          .select(
            "sigla, consulta_processual_url, consulta_processual_fonte, consulta_processual_verificada_em, balcao_virtual_url, balcao_virtual_fonte, balcao_virtual_verificada_em, certidoes_url, certidoes_tipo, certidoes_fonte, certidoes_verificada_em, certidoes_email, certidoes_telefone, certidoes_instrucoes, certidoes_fonte_normativa_url",
          )
          .in("sigla", unicas)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (unid.error) throw unid.error;
  if (trib.error) throw trib.error;
  return { unidades: unid.data ?? [], tribunais: (trib.data ?? []) as CanaisTribunal[] };
}

export async function salvarComarca(input: ComarcaContatoInput) {
  const { data: sessao } = await supabase.auth.getUser();
  const erroFonte = validarFonteUnidade(input as unknown as Record<string, string | null>);
  if (erroFonte) throw new Error(erroFonte);
  const registro: Record<string, string | boolean | null> = {
    comarca: input.comarca.trim(),
    ativo: input.ativo ?? true,
  };
  for (const c of CAMPOS_TEXTO_UNIDADE) {
    const v = (input as unknown as Record<string, string | null | undefined>)[c];
    registro[c] = typeof v === "string" && v.trim() ? v.trim() : null;
  }

  if (input.id) {
    const { error } = await supabase
      .from("comarcas_contatos")
      .update(registro as TablesInsert<"comarcas_contatos">)
      .eq("id", input.id);
    if (error) throw error;
    return input.id;
  }

  const { data, error } = await supabase
    .from("comarcas_contatos")
    .insert({ ...(registro as TablesInsert<"comarcas_contatos">), autor_id: sessao.user?.id ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function removerComarca(id: string) {
  const { error } = await supabase.from("comarcas_contatos").delete().eq("id", id);
  if (error) throw error;
}

/** Texto pronto para colar na observação interna do andamento. */
export function resumoContatoComarca(c: ComarcaContato) {
  const partes = [
    `Comarca: ${c.comarca}${c.uf ? ` - ${c.uf}` : ""}`,
    c.tribunal ? `Tribunal: ${c.tribunal}` : "",
    c.vara_cartorio ? `Vara/Cartório: ${c.vara_cartorio}` : "",
    c.telefone ? `Telefone: ${c.telefone}` : "",
    c.whatsapp ? `WhatsApp: ${c.whatsapp}` : "",
    c.email ? `E-mail: ${c.email}` : "",
    c.balcao_virtual_url ? `Balcão virtual: ${c.balcao_virtual_url}` : "",
    c.observacoes ? `Obs.: ${c.observacoes}` : "",
  ].filter(Boolean);
  return partes.join("\n");
}

/** Situações de um pedido já pago que ainda aguarda a entrega da certidão. */
export const STATUS_AGUARDANDO_ENTREGA = ["pago", "em_analise", "protocolado"] as const;

/**
 * Fila de entrega: pedidos pagos que ainda não tiveram a certidão entregue.
 * Ordem FIXA por chegada em ordem DECRESCENTE (mais recentes primeiro),
 * para que a posição na fila não mude quando o operador altera a situação.
 */
export async function listarEntregasPendentes(): Promise<PedidoAdmin[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(COLUNAS as string)
    .in("status", [...STATUS_AGUARDANDO_ENTREGA])
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(200)
    .returns<PedidoAdmin[]>();
  if (error) throw error;
  return (data ?? []).map((p) => ({ ...p, novo: ehNovo(p.created_at) }));
}

/** Etapas rápidas da fila de entrega, na ordem de operação. */
export const ETAPAS_ENTREGA = [
  { valor: "pago", rotulo: "Certidão não solicitada", observacao: "Certidão ainda não solicitada ao tribunal." },
  { valor: "em_analise", rotulo: "Solicitação em andamento", observacao: "Solicitação da certidão em andamento junto ao tribunal." },
  { valor: "protocolado", rotulo: "Certidão solicitada", observacao: "Certidão solicitada/protocolada no tribunal." },
  { valor: "emitida", rotulo: "Certidão entregue", observacao: "Certidão emitida e entregue ao cliente." },
] as const;

export type EtapaEntrega = (typeof ETAPAS_ENTREGA)[number]["valor"];

/** Etapa exibida como ativa para um status de pedido. */
export function etapaAtualEntrega(status: string): EtapaEntrega | null {
  if (status === "em_analise") return "em_analise";
  if (status === "protocolado") return "protocolado";
  if (status === "emitida") return "emitida";
  if (status === "pago") return "pago";
  return null;
}

/**
 * Aplica uma etapa da fila de entrega, registrando o andamento.
 * Não altera a data de pagamento já registrada.
 */
export async function definirEtapaEntrega(pedidoId: string, etapa: EtapaEntrega) {
  const item = ETAPAS_ENTREGA.find((e) => e.valor === etapa)!;
  const { data: sessao } = await supabase.auth.getUser();
  const { error: erroPedido } = await supabase
    .from("pedidos")
    .update({ status: item.valor })
    .eq("id", pedidoId);
  if (erroPedido) throw erroPedido;
  const { error } = await supabase.from("pedido_andamentos").insert({
    pedido_id: pedidoId,
    status: item.valor,
    observacao: item.observacao,
    autor_id: sessao.user?.id ?? null,
  });
  if (error) throw error;
}


/** Marca a certidão como emitida e entregue, encerrando o pedido. */
export async function concluirEntrega(pedidoId: string) {
  await registrarAndamento({
    pedidoId,
    status: "emitida",
    observacao: "Certidão emitida e entregue ao cliente.",
  });
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

/**
 * Link de download da certidão emitida para enviar ao cliente.
 * Usa o anexo mais recente do tipo "certidao" e gera um link assinado
 * válido por 7 dias. Retorna null quando o pedido ainda não tem certidão.
 */
export async function linkCertidaoParaCliente(pedidoId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("pedido_anexos")
    .select("caminho")
    .eq("pedido_id", pedidoId)
    .eq("tipo", "certidao")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;

  const { data: assinado } = await supabase.storage
    .from(BUCKET_ANEXOS)
    .createSignedUrl(data.caminho, 60 * 60 * 24 * 7);
  return assinado?.signedUrl ?? null;
}

export async function removerAnexo(anexo: { id: string; caminho: string }) {
  await supabase.storage.from(BUCKET_ANEXOS).remove([anexo.caminho]);
  const { error } = await supabase.from("pedido_anexos").delete().eq("id", anexo.id);
  if (error) throw error;
}