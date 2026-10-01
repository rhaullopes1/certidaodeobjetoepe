import { PRECO_ANTECEDENTES_CENTAVOS, formatarBRL, EMAIL_CONTATO } from "./site";
import { soDigitos } from "./pedidos.schema";
import { gerarCobranca, usuarioOpcionalDaRequisicao } from "./pedidos.server";
import { TIPO_ANTECEDENTES } from "./antecedentes.server";
import type { AntecedentesPedidoInput } from "./antecedentes.schema";
import type { AntecedentesPedidoResumo } from "./antecedentes.functions";

/**
 * Marcador gravado em `numero_processo` para pedidos de antecedentes: a coluna
 * é obrigatória e serve ao fluxo de Objeto e Pé, que aqui não se aplica.
 */
const SEM_PROCESSO = "ANTECEDENTES-PF";

function novoProtocolo() {
  const ano = new Date().getFullYear();
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let aleatorio = "";
  for (const b of bytes) aleatorio += alfabeto[b % alfabeto.length];
  return `ACF${ano}${aleatorio}`;
}

export async function criarPedidoAntecedentesNoBanco(
  data: AntecedentesPedidoInput,
): Promise<AntecedentesPedidoResumo> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Fonte da verdade do preço: constante do servidor, nunca o que vem do navegador.
  const valorCentavos = PRECO_ANTECEDENTES_CENTAVOS;
  if (data.valorTotalCentavos !== valorCentavos) {
    throw new Error("Valor do pedido inconsistente.");
  }

  const nome = data.nome.trim().replace(/\s+/g, " ");
  const cpf = soDigitos(data.cpf);
  const email = data.email.trim().toLowerCase();
  const whatsapp = soDigitos(data.whatsapp);

  // Anti-duplicidade: reenvio do formulário em até 30 minutos reaproveita o pedido.
  const desde = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: existente } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("tipo", TIPO_ANTECEDENTES)
    .eq("cpf", cpf)
    .eq("email", email)
    .eq("status", "aguardando_pagamento")
    .gte("created_at", desde)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existente) return montar(await gerarCobranca(existente as never));

  const registro = {
    protocolo: novoProtocolo(),
    tipo: TIPO_ANTECEDENTES,
    numero_processo: SEM_PROCESSO,
    nome_parte: nome,
    quantidade: 1,
    certidoes: [{ tipo: TIPO_ANTECEDENTES, nomeParte: nome, cpf }],
    cpf,
    email,
    whatsapp,
    valor_centavos: valorCentavos,
    uf: data.ufNascimento,
    ant_nascimento: data.nascimento,
    ant_nome_mae: data.nomeMae ? data.nomeMae.trim() : null,
    ant_nome_pai: data.nomePai ? data.nomePai.trim() : null,
    ant_uf_nascimento: data.ufNascimento,
    user_id: await usuarioOpcionalDaRequisicao(),
  };

  const { data: row, error } = await supabaseAdmin
    .from("pedidos")
    .insert(registro)
    .select("*")
    .single();

  if (error || !row) {
    console.error("Falha ao criar pedido de antecedentes", error);
    throw new Error("Não foi possível registrar seu pedido. Tente novamente.");
  }

  const resumo = montar(await gerarCobranca(row as never));
  await avisarEquipe(resumo, whatsapp);
  return resumo;
}

function montar(row: Record<string, unknown>): AntecedentesPedidoResumo {
  return {
    protocolo: String(row["protocolo"]),
    nome: String(row["nome_parte"] ?? ""),
    email: String(row["email"] ?? ""),
    valorCentavos: Number(row["valor_centavos"] ?? PRECO_ANTECEDENTES_CENTAVOS),
    status: String(row["status"] ?? "aguardando_pagamento"),
    criadoEm: String(row["created_at"] ?? new Date().toISOString()),
    pixCopiaECola: (row["pix_codigo"] as string | null) ?? null,
    pixQrCodeUrl: (row["pix_qrcode_url"] as string | null) ?? null,
    checkoutUrl: (row["checkout_url"] as string | null) ?? null,
    confirmacaoAutomatica: Boolean(row["mercadopago_payment_id"]),
  };
}

async function avisarEquipe(resumo: AntecedentesPedidoResumo, whatsapp: string) {
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail("novo-pedido-admin", EMAIL_CONTATO, {
      idempotencyKey: `novo-pedido-admin-${resumo.protocolo}`,
      templateData: {
        protocolo: resumo.protocolo,
        quantidade: 1,
        valor: formatarBRL(resumo.valorCentavos),
        email: resumo.email,
        whatsapp,
        certidoes: [{ nomeParte: resumo.nome, numeroProcesso: "Antecedentes Criminais Federal" }],
        url: `https://certidaodeobjetoepe.org/admin/${resumo.protocolo}`,
      },
    });
  } catch (e) {
    console.error("Falha ao notificar equipe do pedido de antecedentes", e);
  }
}
