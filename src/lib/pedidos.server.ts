import { PIX, PRECO_CENTAVOS } from "./site";
import { gerarPixCopiaECola } from "./pix";
import { soDigitos, type PedidoInput } from "./pedidos.schema";

export type PedidoResumo = {
  protocolo: string;
  numeroProcesso: string;
  uf: string;
  cidade: string;
  cpf: string;
  email: string;
  whatsapp: string;
  observacoes: string | null;
  valorCentavos: number;
  status: string;
  criadoEm: string;
  pixCopiaECola: string;
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

function montar(row: {
  protocolo: string;
  numero_processo: string;
  uf: string;
  cidade: string;
  cpf: string;
  email: string;
  whatsapp: string;
  observacoes: string | null;
  valor_centavos: number;
  status: string;
  created_at: string;
}): PedidoResumo {
  return {
    protocolo: row.protocolo,
    numeroProcesso: row.numero_processo,
    uf: row.uf,
    cidade: row.cidade,
    cpf: mascararCpf(row.cpf),
    email: row.email,
    whatsapp: row.whatsapp,
    observacoes: row.observacoes,
    valorCentavos: row.valor_centavos,
    status: row.status,
    criadoEm: row.created_at,
    pixCopiaECola: gerarPixCopiaECola({
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

  const registro = {
    protocolo: novoProtocolo(),
    numero_processo: data.numeroProcesso,
    uf: data.uf.toUpperCase(),
    cidade: data.cidade,
    cpf: soDigitos(data.cpf),
    email: data.email.toLowerCase(),
    whatsapp: soDigitos(data.whatsapp),
    observacoes: data.observacoes ? data.observacoes : null,
    valor_centavos: PRECO_CENTAVOS,
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

  return montar(row);
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
  return row ? montar(row) : null;
}