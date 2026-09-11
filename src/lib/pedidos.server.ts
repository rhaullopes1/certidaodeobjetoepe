import { PIX, precoCentavos, formatarBRL, DIAS_PARA_EXPIRAR, EMAIL_CONTATO } from "./site";

import { gerarPixCopiaECola } from "./pix";
import {
  soDigitos,
  cpfValido,
  nomeCompletoValido,
  numeroProcessoValido,
  type PedidoInput,
} from "./pedidos.schema";
import { analisarNup } from "./cnj";
import { decodificarPartes } from "./cnj.functions";


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
  certidoes: { numeroProcesso: string; nomeParte: string; cpf: string; observacoes?: string | null }[];
  valorCentavos: number;
  status: string;
  criadoEm: string;
  pixCopiaECola: string;
  pixQrCodeUrl: string | null;
  checkoutUrl: string | null;
  pagoEm: string | null;
  /** True apenas quando o Pix exibido é de um gateway com baixa automática. */
  confirmacaoAutomatica: boolean;
  /** True quando existe link de cartão (Stripe), que confirma automaticamente. */
  confirmacaoAutomaticaCartao: boolean;
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
  certidoes?: unknown;
  valor_centavos: number;
  status: string;
  created_at: string;
  pix_codigo?: string | null;
  pix_qrcode_url?: string | null;
  stripe_session_id?: string | null;
  checkout_url?: string | null;
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
    certidoes: Array.isArray(row.certidoes)
      ? (row.certidoes as { numeroProcesso: string; nomeParte: string; cpf: string; observacoes?: string | null }[]).map((c) => ({
          numeroProcesso: c.numeroProcesso,
          nomeParte: c.nomeParte,
          cpf: mascararCpf(c.cpf ?? ""),
          observacoes: c.observacoes ?? null,
        }))
      : [],
    valorCentavos: row.valor_centavos,
    status: row.status,
    criadoEm: row.created_at,
    pixQrCodeUrl: row.pix_qrcode_url ?? null,
    checkoutUrl: row.checkout_url ?? null,
    pagoEm: row.pago_em ?? null,
    confirmacaoAutomatica: Boolean(row.checkout_url),

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

/**
 * Revalidação no servidor: mesmo que o navegador seja contornado (chamada direta
 * ao endpoint), CPF, nome completo e número do processo são conferidos de novo.
 */
function validarCertidaoNoServidor(
  c: { numeroProcesso: string; nomeParte: string; cpf: string; observacoes?: string | null },
  rotulo: string,
) {
  const numeroProcesso = c.numeroProcesso.trim();
  const nomeParte = c.nomeParte.trim().replace(/\s+/g, " ");
  const cpf = soDigitos(c.cpf);
  if (!numeroProcessoValido(numeroProcesso)) {
    throw new Error(`${rotulo}: número do processo inválido.`);
  }
  if (!nomeCompletoValido(nomeParte)) {
    throw new Error(`${rotulo}: informe o nome completo da parte envolvida.`);
  }
  if (!cpfValido(cpf)) {
    throw new Error(`${rotulo}: CPF inválido.`);
  }
  const observacoes = c.observacoes ? String(c.observacoes).trim().slice(0, 1000) : null;
  return { numeroProcesso, nomeParte, cpf, observacoes };
}

/**
 * Lê o usuário logado a partir do cabeçalho Authorization, quando existir.
 * O pedido continua funcionando sem conta; havendo conta, fica vinculado a ela.
 */
export async function usuarioOpcionalDaRequisicao(): Promise<string | null> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const header = request?.headers?.get("authorization");
    if (!header?.startsWith("Bearer ")) return null;
    const token = header.slice(7);
    if (token.split(".").length !== 3) return null;

    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return null;
    const cliente = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data, error } = await cliente.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    return String(data.claims.sub);
  } catch {
    return null;
  }
}

export async function criarPedidoNoBanco(data: PedidoInput): Promise<PedidoResumo> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Fonte da verdade do preço: tabela oficial no servidor.
  const valorCentavos = precoCentavos(data.quantidade);
  if (valorCentavos !== data.valorTotalCentavos) {
    throw new Error("Valor do pedido inconsistente com a quantidade selecionada.");
  }

  const principal = validarCertidaoNoServidor(data, "Certidão 1");
  if (data.certidoes.length !== data.quantidade) {
    throw new Error("Preencha os dados de cada certidão solicitada.");
  }
  const certidoes = data.certidoes.map((c, i) =>
    validarCertidaoNoServidor(c, `Certidão ${i + 1}`),
  );

  const email = data.email.trim().toLowerCase();

  // Anti-duplicidade: reenvio do formulário em poucos minutos reaproveita o pedido.
  const desde = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: existente } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("numero_processo", principal.numeroProcesso)
    .eq("cpf", principal.cpf)
    .eq("email", email)
    .eq("status", "aguardando_pagamento")
    .gte("created_at", desde)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existente) {
    return montar(await gerarCobranca(existente as PedidoRow));
  }

  // Reconhecimento automático do número único: preenche tribunal/estado/cidade.
  const partes = analisarNup(principal.numeroProcesso);
  const decodificado = partes ? await decodificarPartes(partes) : null;

  const registro = {
    protocolo: novoProtocolo(),
    numero_processo: principal.numeroProcesso,
    nome_parte: principal.nomeParte,
    quantidade: data.quantidade,
    certidoes,
    cpf: principal.cpf,
    email,
    whatsapp: soDigitos(data.whatsapp),
    observacoes: data.observacoes ? data.observacoes.trim() : null,
    valor_centavos: valorCentavos,
    uf: decodificado?.uf ?? null,
    cidade: decodificado?.cidade ?? null,
    user_id: await usuarioOpcionalDaRequisicao(),
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

  const resumo = montar(await gerarCobranca(row));
  await enviarConfirmacaoPorEmail(resumo, certidoes);
  await enviarNotificacaoAdmin(resumo, certidoes);
  return resumo;
}

/** Envio best-effort do e-mail de confirmação; nunca bloqueia a criação do pedido. */
async function enviarConfirmacaoPorEmail(
  resumo: PedidoResumo,
  certidoes: Array<{ numeroProcesso: string; nomeParte: string; cpf: string; observacoes?: string | null }>,
) {
  if (!resumo.email) return;
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail("pedido-confirmacao", resumo.email, {
      idempotencyKey: `pedido-confirmacao-${resumo.protocolo}`,
      replyTo: EMAIL_CONTATO,
      templateData: {
        protocolo: resumo.protocolo,
        quantidade: certidoes.length,
        valor: formatarBRL(resumo.valorCentavos),
        certidoes,
        url: `https://certidaodeobjetoepe.org/pedido/${resumo.protocolo}`,
      },
    });
  } catch (e) {
    console.error("Falha ao enviar e-mail de confirmação", e);
  }
}

/** Notifica a equipe a cada venda confirmada pelo site. Best-effort: não bloqueia o pedido. */
async function enviarNotificacaoAdmin(
  resumo: PedidoResumo,
  certidoes: Array<{ numeroProcesso: string; nomeParte: string; cpf: string; observacoes?: string | null }>,
) {
  const emailsAdmin = [
    EMAIL_CONTATO,
  ];

  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await Promise.all(
      emailsAdmin.map((email) =>
        sendTemplateEmail("novo-pedido-admin", email, {
          idempotencyKey: `novo-pedido-admin-${resumo.protocolo}-${email}`,
          templateData: {
            protocolo: resumo.protocolo,
            quantidade: certidoes.length,
            valor: formatarBRL(resumo.valorCentavos),
            email: resumo.email,
            whatsapp: resumo.whatsapp,
            certidoes,
            url: `https://certidaodeobjetoepe.org/admin/${resumo.protocolo}`,
          },
        }),
      ),
    );
  } catch (e) {
    console.error("Falha ao enviar notificação interna de novo pedido", e);
  }
}



type PedidoRow = Parameters<typeof montar>[0] & {
  pagbank_order_id?: string | null;
  id?: string;
};

/** Cria a sessão de pagamento na Stripe (cartão + Pix) e grava no pedido. */
async function gerarCobranca(row: PedidoRow): Promise<PedidoRow> {
  const { temStripe, criarCheckout } = await import("./stripe.server");
  if (row.checkout_url || !temStripe()) return row;
  try {
    const cobranca = await criarCheckout({
      protocolo: row.protocolo,
      email: row.email,
      quantidade: row.quantidade ?? 1,
      valorCentavos: row.valor_centavos,
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: atualizado } = await supabaseAdmin
      .from("pedidos")
      .update({
        stripe_session_id: cobranca.sessionId,
        checkout_url: cobranca.checkoutUrl,
        pix_expira_em: cobranca.expiraEm,
      })
      .eq("protocolo", row.protocolo)
      .select("*")
      .maybeSingle();
    return (atualizado as PedidoRow) ?? row;
  } catch (e) {
    console.error("Falha ao criar cobrança na Stripe", e);
    await registrarAlertaCheckout(row, e);
    return row;
  }
}

/**
 * Registra no histórico do pedido (visível no painel) quando o link de
 * pagamento não pôde ser gerado — a equipe age no mesmo dia.
 * Só grava um alerta a cada 6 horas para não poluir a linha do tempo.
 */
async function registrarAlertaCheckout(row: PedidoRow, erro: unknown) {
  const pedidoId = row.id;
  if (!pedidoId) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const desde = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: recente } = await supabaseAdmin
      .from("pedido_andamentos")
      .select("id")
      .eq("pedido_id", pedidoId)
      .gte("created_at", desde)
      .like("observacao", "[ALERTA] Link de pagamento%")
      .limit(1);
    if (recente?.length) return;

    await supabaseAdmin.from("pedido_andamentos").insert({
      pedido_id: pedidoId,
      status: row.status,
      observacao: `[ALERTA] Link de pagamento não gerado — ${
        erro instanceof Error ? erro.message : "erro desconhecido"
      }. Verifique a configuração de pagamentos e reenvie o link ao cliente.`,
    });
  } catch (e) {
    console.error("Falha ao registrar alerta de checkout", e);
  }
}

/**
 * Descarta a sessão atual e gera um novo link de pagamento.
 * Usado pelo botão "Tentar novamente" na página do pedido.
 */
export async function regerarCobrancaDoPedido(protocolo: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("protocolo", protocolo.toUpperCase())
    .maybeSingle();

  if (!row) return null;
  if (row.status !== "aguardando_pagamento") return montar(row as PedidoRow);

  await supabaseAdmin
    .from("pedidos")
    .update({ stripe_session_id: null, checkout_url: null, pix_expira_em: null })
    .eq("protocolo", row.protocolo);

  const atualizado = await gerarCobranca({
    ...(row as PedidoRow),
    stripe_session_id: null,
    checkout_url: null,
  });
  return montar(atualizado);
}



/**
 * Pedido sem pagamento há mais de DIAS_PARA_EXPIRAR dias vira "expirado".
 * A verificação acontece na leitura (pública e do painel), sem rotina externa.
 */
export async function marcarExpiradoSeVencido(row: PedidoRow): Promise<PedidoRow> {
  if (row.status !== "aguardando_pagamento") return row;
  const criadoEm = new Date(row.created_at).getTime();
  if (Date.now() - criadoEm < DIAS_PARA_EXPIRAR * 24 * 60 * 60 * 1000) return row;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: atualizado } = await supabaseAdmin
    .from("pedidos")
    .update({ status: "expirado" })
    .eq("protocolo", row.protocolo)
    .eq("status", "aguardando_pagamento")
    .select("*")
    .maybeSingle();
  return (atualizado as PedidoRow) ?? { ...row, status: "expirado" };
}

/**
 * Envia lembrete por e-mail para pedidos sem pagamento há mais de 24h
 * (uma única vez por pedido). Executa na leitura, sem rotina externa.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function processarLembretesPagamento() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: pendentes } = await supabaseAdmin
    .from("pedidos")
    .select("protocolo, email, valor_centavos")
    .eq("status", "aguardando_pagamento")
    .is("lembrete_enviado_em", null)
    .lt("created_at", limite)
    .limit(10);

  if (!pendentes?.length) return;

  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  for (const p of pendentes) {
    try {
      await sendTemplateEmail("pedido-lembrete", p.email, {
        replyTo: EMAIL_CONTATO,
        idempotencyKey: `pedido-lembrete-${p.protocolo}`,
        templateData: {
          protocolo: p.protocolo,
          valor: formatarBRL(p.valor_centavos),
          url: `https://certidaodeobjetoepe.org/pedido/${p.protocolo}`,
        },
      });
    } catch (e) {
      console.error("Falha ao enviar lembrete de pagamento", p.protocolo, e);
    }
    await supabaseAdmin
      .from("pedidos")
      .update({ lembrete_enviado_em: new Date().toISOString() })
      .eq("protocolo", p.protocolo);
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

  let atual = await marcarExpiradoSeVencido(row as PedidoRow);
  // Lembretes de pagamento agora são enviados pela automação de recuperação
  // (tabela abandoned_orders + rotina agendada), evitando e-mails duplicados.

  // Garante que existe cobrança Pix (pedidos criados antes da integração).
  if (atual.status === "aguardando_pagamento") {
    atual = await gerarCobranca(atual);
    atual = await sincronizarPagamento(atual);
  }

  return montar(atual);
}

/**
 * Reenvia o e-mail de confirmação com o link do pedido.
 * Só envia se o e-mail informado for o mesmo cadastrado no pedido.
 */
export async function reenviarEmailPedidoNoBanco(protocolo: string, email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("pedidos")
    .select("*")
    .eq("protocolo", protocolo.toUpperCase())
    .maybeSingle();

  if (!row || row.email.toLowerCase() !== email.trim().toLowerCase()) {
    // Não revelamos se o protocolo existe — resposta genérica.
    return { enviado: false };
  }

  const certidoes = Array.isArray(row.certidoes)
    ? (row.certidoes as { numeroProcesso: string; nomeParte: string; cpf: string; observacoes?: string | null }[])
    : [];
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  await sendTemplateEmail("pedido-confirmacao", row.email, {
    idempotencyKey: `pedido-reenvio-${row.protocolo}-${Date.now()}`,
    replyTo: EMAIL_CONTATO,
    templateData: {
      protocolo: row.protocolo,
      quantidade: row.quantidade ?? certidoes.length,
      valor: formatarBRL(row.valor_centavos),
      certidoes,
      url: `https://certidaodeobjetoepe.org/pedido/${row.protocolo}`,
    },
  });
  return { enviado: true };
}

/** Confere o status direto na Stripe — rede de segurança caso o webhook falhe. */
async function sincronizarPagamento(row: PedidoRow): Promise<PedidoRow> {
  const { temStripe, consultarCheckout } = await import("./stripe.server");
  if (!row.stripe_session_id || !temStripe()) return row;
  try {
    const situacao = await consultarCheckout(row.stripe_session_id);

    // Link vencido: o pedido continua válido até DIAS_PARA_EXPIRAR dias.
    // Limpamos a sessão para que um novo link seja gerado na próxima leitura.
    if (!situacao.pago) {
      if (!situacao.expirado) return row;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("pedidos")
        .update({ stripe_session_id: null, checkout_url: null, pix_expira_em: null })
        .eq("protocolo", row.protocolo);
      return gerarCobranca({ ...row, stripe_session_id: null, checkout_url: null });
    }

    const patch = { status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() };

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