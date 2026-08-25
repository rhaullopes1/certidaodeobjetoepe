import { PIX, precoCentavos } from "./site";
import { gerarPixCopiaECola } from "./pix";
import { soDigitos, type PedidoInput } from "./pedidos.schema";

export type PedidoResumo = {
  protocolo: string;
  numeroProcesso: string;
  nomeParte: string;
  quantidade: number;
  uf: string | null;
  cidade: string | null;
  cpf: string;
  email: string;
  whatsapp: string;
  observacoes: string | null;
  valorCentavos: number;
  status: string;
  criadoEm: string;
  pixCopiaECola: string;
  pixQrCodeUrl: string | null;
  pagoEm: string | null;
  confirmacaoAutomatica: boolean;
};

function novoProtocolo() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const aleatorio = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  const tempo = agora.getTime().toString(36).toUpperCase().slice(-4);
  return `COP${ano}${tempo}${aleatorio}`;
}

function mascararCpf(cpf: string) {
  const d = soDigitos(cpf);
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
}

function formatarWhatsapp(valor: string) {
  const d = soDigitos(valor);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return valor;
}

function montar(row: {
  protocolo: string;
  numero_processo: string;
  nome_parte?: string | null;
  quantidade?: number | null;
  uf: string | null;
  cidade: string | null;
  cpf: string;
  email: string;
  whatsapp: string;
  observacoes: string | null;
  valor_centavos: number;
  status: string;
  created_at: string;
  pix_codigo?: string | null;
  pix_qrcode_url?: string | null;
  pago_em?: string | null;
}): PedidoResumo {
  return {
    protocolo: row.protocolo,
    numeroProcesso: row.numero_processo,
    nomeParte: row.nome_parte ?? "",
    quantidade: row.quantidade ?? 1,
    uf: row.uf,
    cidade: row.cidade,
    cpf: mascararCpf(row.cpf),
    email: row.email,
    whatsapp: formatarWhatsapp(row.whatsapp),
    observacoes: row.observacoes,
    valorCentavos: row.valor_centavos,
    status: row.status,
    criadoEm: row.created_at,
    pixQrCodeUrl: row.pix_qrcode_url ?? null,
    pagoEm: row.pago_em ?? null,
    confirmacaoAutomatica: Boolean(row.pix_codigo),
    pixCopiaECola:
      row.pix_codigo ??
      gerarPixCopiaECola({
      chave: PIX.chave,
      nome: PIX.nome,
      cidade: PIX.cidade,
      valorCentavos: row.valor_centavos,
      txid: row.protocolo,
    }),
  };
}

export async function criarPedidoNoBanco(data: PedidoInput): Promise<PedidoResumo> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Fonte da verdade do preço: tabela oficial no servidor.
  const valorCentavos = precoCentavos(data.quantidade);
  if (valorCentavos !== data.valorTotalCentavos) {
    throw new Error("Valor do pedido inconsistente com a quantidade selecionada.");
  }

  const registro = {
    protocolo: novoProtocolo(),
    numero_processo: data.numeroProcesso,
    nome_parte: data.nomeParte,
    quantidade: data.quantidade,
    cpf: soDigitos(data.cpf),
    email: data.email.toLowerCase(),
    whatsapp: soDigitos(data.whatsapp),
    observacoes: data.observacoes ? data.observacoes : null,
    valor_centavos: valorCentavos,
  };

  const { data: row, error } = await supabaseAdmin
    .from("pedidos")
    .insert(registro)
    .select("*")
    .single();

  if (error || !row) {
    console.error("Falha ao criar pedido", error);
    throw new Error("Não foi possível registrar seu pedido. Tente novamente.");
  }

  if (row.valor_centavos !== valorCentavos) {
    throw new Error("Valor gravado divergente do esperado.");
  }

  return montar(await gerarCobranca(row));
}

type PedidoRow = Parameters<typeof montar>[0] & { pagbank_order_id?: string | null };

/** Cria a cobrança Pix dinâmica no provedor ativo e grava no pedido. Em caso de falha, mantém o Pix estático. */
async function gerarCobranca(row: PedidoRow): Promise<PedidoRow> {
  const { provedorAtivo, gateway } = await import("./pagamentos.server");
  const provedor = provedorAtivo();
  if (row.pix_codigo || !provedor) return row;
  try {
    const { criarCobrancaPix } = await gateway(provedor);
    const cobranca = await criarCobrancaPix({
      protocolo: row.protocolo,
      nomeParte: row.nome_parte ?? undefined,
      email: row.email,
      cpf: row.cpf,
      whatsapp: row.whatsapp,
      valorCentavos: row.valor_centavos,
    } as Parameters<typeof criarCobrancaPix>[0]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: atualizado } = await supabaseAdmin
      .from("pedidos")
      .update({
        pagbank_order_id: cobranca.orderId,
        pix_codigo: cobranca.codigo,
        pix_qrcode_url: cobranca.qrCodeUrl,
        pix_expira_em: cobranca.expiraEm,
      })
      .eq("protocolo", row.protocolo)
      .select("*")
      .maybeSingle();
    return (atualizado as PedidoRow) ?? row;
  } catch (e) {
    console.error("Falha ao criar cobrança Pix", e);
    return row;
  }
}

export async function buscarPedidoPorProtocolo(protocolo: string): Promise<PedidoResumo | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: row, error } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("protocolo", protocolo.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error("Falha ao buscar pedido", error);
    throw new Error("Não foi possível consultar o pedido.");
  }
  if (!row) return null;

  let atual = row as PedidoRow;

  // Garante que existe cobrança Pix (pedidos criados antes da integração).
  if (atual.status === "aguardando_pagamento") {
    atual = await gerarCobranca(atual);
    atual = await sincronizarPagamento(atual);
  }

  return montar(atual);
}

/** Confere o status direto no PagBank — rede de segurança caso o webhook falhe. */
async function sincronizarPagamento(row: PedidoRow): Promise<PedidoRow> {
  const { provedorAtivo, gateway } = await import("./pagamentos.server");
  const provedor = provedorAtivo();
  if (!row.pagbank_order_id || !provedor) return row;
  try {
    const { consultarCobranca } = await gateway(provedor);
    const situacao = await consultarCobranca(row.pagbank_order_id);
    if (!situacao.pago && !situacao.cancelado) return row;

    const patch = situacao.pago
      ? { status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() }
      : { status: "cancelado" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: atualizado } = await supabaseAdmin
      .from("pedidos")
      .update(patch)
      .eq("protocolo", row.protocolo)
      .select("*")
      .maybeSingle();
    return (atualizado as PedidoRow) ?? { ...row, ...patch };
  } catch (e) {
    console.error("Falha ao sincronizar pagamento", e);
    return row;
  }
}