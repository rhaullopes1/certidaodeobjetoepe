import { formatarBRL, EMAIL_CONTATO } from "./site";

/**
 * Campanha de reativação: pedidos que nunca foram pagos (cancelados, expirados
 * ou aguardando há mais de 3 dias). O cliente reabre o mesmo pedido pelo link.
 */
export type LinhaReativacao = {
  id: string;
  protocolo: string;
  nome: string | null;
  email: string;
  whatsapp: string;
  numeroProcesso: string;
  finalidade: string | null;
  status: string;
  valorCentavos: number;
  criadoEm: string;
  contatoEm: string | null;
  emailEm: string | null;
};

const DIAS_MINIMOS = 3;

async function buscarElegiveis(limite = 1000) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const corte = new Date(Date.now() - DIAS_MINIMOS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select(
      "id, protocolo, nome_parte, email, whatsapp, numero_processo, finalidade, status, valor_centavos, created_at, reativacao_contato_em, reativacao_email_em, mercadopago_status",
    )
    .in("status", ["cancelado", "expirado", "aguardando_pagamento"])
    .is("pago_em", null)
    .gt("valor_centavos", 0)
    .not("protocolo", "like", "TESTE%")
    .lt("created_at", corte)
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) throw new Error("Não foi possível carregar a lista de reativação.");
  return (data ?? []).filter(
    (r) => r.mercadopago_status !== "refunded" && r.mercadopago_status !== "charged_back",
  );
}

export async function listarReativacao(): Promise<LinhaReativacao[]> {
  const linhas = await buscarElegiveis();
  return linhas.map((r) => ({
    id: r.id,
    protocolo: r.protocolo,
    nome: r.nome_parte,
    email: r.email,
    whatsapp: r.whatsapp,
    numeroProcesso: r.numero_processo,
    finalidade: r.finalidade,
    status: r.status,
    valorCentavos: r.valor_centavos,
    criadoEm: r.created_at,
    contatoEm: r.reativacao_contato_em,
    emailEm: r.reativacao_email_em,
  }));
}

export async function registrarContatoReativacao(id: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("pedidos")
    .update({ reativacao_contato_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error("Não foi possível registrar o contato.");
  return { ok: true };
}

/**
 * Disparo dos dias 5 e 10. Cada pedido recebe no máximo um e-mail a cada
 * 4 dias (assim o dia 5 e o dia 10 do mesmo mês contam, mas reexecuções não
 * duplicam). Respeita a lista de descadastro.
 */
export async function enviarEmailsReativacao(limite = 300) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

  const intervalo = Date.now() - 4 * 24 * 60 * 60 * 1000;
  // E-mail automático: só pedidos criados nos últimos 30 dias.
  const janela30d = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const [todos, optouts] = await Promise.all([
    buscarElegiveis(2000),
    supabaseAdmin.from("email_optouts").select("email").limit(10000),
  ]);
  const elegiveis = todos.filter((r) => new Date(r.created_at).getTime() >= janela30d);
  const bloqueados = new Set((optouts.data ?? []).map((o) => o.email.toLowerCase()));
  const jaEnviados = new Set<string>();
  const hoje = new Date().toISOString().slice(0, 10);

  let enviados = 0;
  let falhas = 0;
  for (const r of elegiveis) {
    if (enviados >= limite) break;
    const email = r.email?.trim().toLowerCase();
    if (!email || bloqueados.has(email) || jaEnviados.has(email)) continue;
    if (r.reativacao_email_em && new Date(r.reativacao_email_em).getTime() > intervalo) continue;
    jaEnviados.add(email); // um e-mail por cliente, mesmo com vários pedidos

    try {
      await sendTemplateEmail("reativacao-mensal", r.email, {
        idempotencyKey: `reativacao-${r.protocolo}-${hoje}`,
        replyTo: EMAIL_CONTATO,
        templateData: {
          nome: r.nome_parte?.trim().split(/\s+/)[0] ?? undefined,
          protocolo: r.protocolo,
          processo: r.numero_processo,
          valor: formatarBRL(r.valor_centavos),
          parcela: formatarBRL(Math.ceil(r.valor_centavos / 3)),
          url: `https://certidaodeobjetoepe.org/pedido/${r.protocolo}`,
        },
      });
      await supabaseAdmin
        .from("pedidos")
        .update({ reativacao_email_em: new Date().toISOString() })
        .eq("id", r.id);
      enviados++;
    } catch (e) {
      falhas++;
      console.error("Falha no e-mail de reativação", r.protocolo, e);
    }
  }
  return { elegiveis: elegiveis.length, enviados, falhas };
}
