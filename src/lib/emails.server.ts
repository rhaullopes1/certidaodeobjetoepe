import { formatarBRL } from "./site";

const SITE_URL = "https://certidaodeobjetoepe.org";
const LOTE_CAMPANHA = 50;
const LOCK_NOME = "campanha-semanal";
const LOCK_MINUTOS = 10;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function aplicarVariaveisCliente(
  texto: string,
  vars: { nome_cliente: string; email_cliente: string },
) {
  return texto
    .replace(/\{\{\s*nome_cliente\s*\}\}/g, vars.nome_cliente)
    .replace(/\{\{\s*email_cliente\s*\}\}/g, vars.email_cliente);
}

/* ------------------------------------------------------------------ */
/* Boas-vindas                                                         */
/* ------------------------------------------------------------------ */

export async function lerConfigEmail(chave: string) {
  const db = await admin();
  const { data } = await db
    .from("email_config")
    .select("chave, assunto, corpo, ativo")
    .eq("chave", chave)
    .maybeSingle();
  return data;
}

export async function salvarConfigEmail(input: {
  chave: string;
  assunto: string;
  corpo: string;
  ativo: boolean;
}) {
  const db = await admin();
  const { error } = await db
    .from("email_config")
    .update({ assunto: input.assunto, corpo: input.corpo, ativo: input.ativo })
    .eq("chave", input.chave);
  if (error) throw new Error("Não foi possível salvar o texto do e-mail.");
  return { ok: true };
}

/** Envia o e-mail de boas-vindas uma única vez por cliente. */
export async function enviarBoasVindas(userId: string) {
  const db = await admin();
  const { data: perfil } = await db
    .from("profiles")
    .select("id, nome, email, status_conta, boas_vindas_em")
    .eq("id", userId)
    .maybeSingle();

  if (!perfil?.email) return { enviado: false, motivo: "sem_email" as const };
  if (perfil.boas_vindas_em) return { enviado: false, motivo: "ja_enviado" as const };
  if (perfil.status_conta !== "ativa") return { enviado: false, motivo: "descadastrado" as const };

  const config = await lerConfigEmail("boas-vindas");
  if (!config || !config.ativo) return { enviado: false, motivo: "inativo" as const };

  const vars = {
    nome_cliente: perfil.nome?.split(" ")[0] || "cliente",
    email_cliente: perfil.email,
  };
  const assunto = aplicarVariaveisCliente(config.assunto, vars);
  const corpo = aplicarVariaveisCliente(config.corpo, vars);

  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const resultado = await sendTemplateEmail("boas-vindas", perfil.email, {
    idempotencyKey: `boas-vindas-${userId}`,
    templateData: { assunto, corpo },
  });

  const agora = new Date().toISOString();
  await db
    .from("profiles")
    .update({ boas_vindas_em: agora, ultimo_email_enviado: agora })
    .eq("id", userId);

  return { enviado: resultado.sent, motivo: resultado.sent ? null : resultado.reason };
}

export async function enviarBoasVindasTeste(email: string, nome: string) {
  const config = await lerConfigEmail("boas-vindas");
  if (!config) throw new Error("Texto de boas-vindas não configurado.");
  const vars = { nome_cliente: nome || "cliente", email_cliente: email };
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  await sendTemplateEmail("boas-vindas", email, {
    templateData: {
      assunto: aplicarVariaveisCliente(config.assunto, vars),
      corpo: aplicarVariaveisCliente(config.corpo, vars),
    },
  });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Contatos                                                            */
/* ------------------------------------------------------------------ */

export type Contato = { email: string; nome: string | null; temConta: boolean };

/** Contas cadastradas + e-mails de quem já fez pedido, sem duplicar e sem descadastrados. */
export async function listarContatos(): Promise<Contato[]> {
  const db = await admin();

  const [{ data: perfis }, { data: pedidos }, { data: optouts }] = await Promise.all([
    db.from("profiles").select("email, nome, status_conta").eq("status_conta", "ativa").limit(5000),
    db.from("pedidos").select("email, nome_parte").limit(5000),
    db.from("email_optouts").select("email").limit(5000),
  ]);

  const bloqueados = new Set((optouts ?? []).map((o) => o.email.toLowerCase()));
  const mapa = new Map<string, Contato>();

  for (const p of perfis ?? []) {
    const email = (p.email ?? "").trim().toLowerCase();
    if (!email || bloqueados.has(email)) continue;
    mapa.set(email, { email, nome: p.nome, temConta: true });
  }
  for (const p of pedidos ?? []) {
    const email = (p.email ?? "").trim().toLowerCase();
    if (!email || bloqueados.has(email) || mapa.has(email)) continue;
    mapa.set(email, { email, nome: p.nome_parte, temConta: false });
  }

  return [...mapa.values()];
}

/* ------------------------------------------------------------------ */
/* Campanhas semanais                                                  */
/* ------------------------------------------------------------------ */

export type Campanha = {
  id: string;
  titulo: string;
  assunto: string;
  conteudo_html: string;
  agendamento_data: string | null;
  status: string;
  total_destinatarios: number;
  total_enviados: number;
  total_falhas: number;
  enviado_em: string | null;
  created_at: string;
};

export async function listarCampanhas(): Promise<Campanha[]> {
  const db = await admin();
  const { data } = await db
    .from("weekly_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Campanha[];
}

export async function salvarCampanha(input: {
  id?: string;
  titulo: string;
  assunto: string;
  conteudo: string;
  agendamento: string | null;
  status: "rascunho" | "agendado";
}) {
  const db = await admin();
  const registro = {
    titulo: input.titulo,
    assunto: input.assunto,
    conteudo_html: input.conteudo,
    agendamento_data: input.agendamento,
    status: input.status,
  };

  if (input.id) {
    const { error } = await db.from("weekly_campaigns").update(registro).eq("id", input.id);
    if (error) throw new Error("Não foi possível salvar a campanha.");
    return { id: input.id };
  }

  const { data, error } = await db
    .from("weekly_campaigns")
    .insert(registro)
    .select("id")
    .maybeSingle();
  if (error || !data) throw new Error("Não foi possível criar a campanha.");
  return { id: data.id };
}

export async function excluirCampanha(id: string) {
  const db = await admin();
  await db.from("weekly_campaigns").delete().eq("id", id).eq("status", "rascunho");
  return { ok: true };
}

async function adquirirLock() {
  const db = await admin();
  const agora = new Date();
  const expira = new Date(agora.getTime() + LOCK_MINUTOS * 60 * 1000).toISOString();

  const { data: atual } = await db
    .from("job_locks")
    .select("nome, expira_em")
    .eq("nome", LOCK_NOME)
    .maybeSingle();

  if (atual && new Date(atual.expira_em).getTime() > agora.getTime()) return false;

  if (atual) {
    const { data } = await db
      .from("job_locks")
      .update({ expira_em: expira })
      .eq("nome", LOCK_NOME)
      .lt("expira_em", agora.toISOString())
      .select("nome")
      .maybeSingle();
    return Boolean(data);
  }

  const { error } = await db.from("job_locks").insert({ nome: LOCK_NOME, expira_em: expira });
  return !error;
}

async function liberarLock() {
  const db = await admin();
  await db.from("job_locks").update({ expira_em: new Date().toISOString() }).eq("nome", LOCK_NOME);
}

/** Cria (uma vez) a lista de destinatários da campanha. */
async function prepararDestinatarios(campanhaId: string) {
  const db = await admin();
  const contatos = await listarContatos();
  if (!contatos.length) return 0;

  const { error } = await db.from("campaign_recipients").upsert(
    contatos.map((c) => ({
      campaign_id: campanhaId,
      email: c.email,
      nome: c.nome,
      status: "pendente",
    })),
    { onConflict: "campaign_id,email", ignoreDuplicates: true },
  );
  if (error) console.error("Falha ao preparar destinatários", error);

  const { count } = await db
    .from("campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campanhaId);

  await db
    .from("weekly_campaigns")
    .update({ total_destinatarios: count ?? contatos.length, status: "enviando" })
    .eq("id", campanhaId);

  return count ?? contatos.length;
}

/** Envia um lote da campanha. Idempotente: só pega destinatários pendentes. */
export async function processarCampanha(campanhaId: string) {
  const db = await admin();
  const { data: campanha } = await db
    .from("weekly_campaigns")
    .select("*")
    .eq("id", campanhaId)
    .maybeSingle();
  if (!campanha) throw new Error("Campanha não encontrada.");
  if (campanha.status === "enviado") return { enviados: 0, restantes: 0, concluida: true };

  if (campanha.status !== "enviando") await prepararDestinatarios(campanhaId);

  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  let enviados = 0;
  let falhas = 0;

  for (;;) {
    const { data: lote } = await db
      .from("campaign_recipients")
      .select("id, email, nome")
      .eq("campaign_id", campanhaId)
      .eq("status", "pendente")
      .limit(LOTE_CAMPANHA);

    if (!lote?.length) break;

    for (const dest of lote) {
      const vars = {
        nome_cliente: dest.nome?.split(" ")[0] || "cliente",
        email_cliente: dest.email,
      };
      try {
        const resultado = await sendTemplateEmail("campanha-semanal", dest.email, {
          idempotencyKey: `campanha-${campanhaId}-${dest.id}`,
          templateData: {
            assunto: aplicarVariaveisCliente(campanha.assunto, vars),
            corpo: aplicarVariaveisCliente(campanha.conteudo_html, vars),
            pixelUrl: `${SITE_URL}/api/public/e/open/${dest.id}`,
            ctaUrl: `${SITE_URL}/api/public/e/click/${dest.id}`,
            ctaTexto: "Solicitar certidão",
          },
        });
        await db
          .from("campaign_recipients")
          .update({
            status: resultado.sent ? "enviado" : "suprimido",
            enviado_em: new Date().toISOString(),
          })
          .eq("id", dest.id);
        if (resultado.sent) enviados += 1;
        else falhas += 1;
      } catch (e) {
        const mensagem = e instanceof Error ? e.message : String(e);
        falhas += 1;
        await db
          .from("campaign_recipients")
          .update({ status: "falha", erro: mensagem })
          .eq("id", dest.id);
        const status = (e as { status?: number } | null)?.status;
        if (status === 402 || status === 403 || status === 429) {
          await atualizarTotais(campanhaId, false);
          return { enviados, falhas, concluida: false, pausado: true };
        }
      }
    }

    if (lote.length < LOTE_CAMPANHA) break;
  }

  await atualizarTotais(campanhaId, true);
  const emails = (await listarContatos()).length;
  await db
    .from("profiles")
    .update({ ultimo_email_enviado: new Date().toISOString() })
    .eq("status_conta", "ativa");

  return { enviados, falhas, concluida: true, contatos: emails };
}

async function atualizarTotais(campanhaId: string, concluir: boolean) {
  const db = await admin();
  const { data } = await db
    .from("campaign_recipients")
    .select("status")
    .eq("campaign_id", campanhaId)
    .limit(10000);

  const linhas = data ?? [];
  const enviados = linhas.filter((l) => l.status === "enviado").length;
  const falhas = linhas.filter((l) => l.status === "falha" || l.status === "suprimido").length;

  await db
    .from("weekly_campaigns")
    .update({
      total_enviados: enviados,
      total_falhas: falhas,
      ...(concluir ? { status: "enviado", enviado_em: new Date().toISOString() } : {}),
    })
    .eq("id", campanhaId);
}

/** Rotina semanal: envia a campanha agendada para o período atual. */
export async function processarSemanal() {
  const ok = await adquirirLock();
  if (!ok) return { executou: false };

  try {
    const db = await admin();
    const agora = new Date().toISOString();

    const { data: emAndamento } = await db
      .from("weekly_campaigns")
      .select("id")
      .eq("status", "enviando")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const alvo =
      emAndamento ??
      (
        await db
          .from("weekly_campaigns")
          .select("id")
          .eq("status", "agendado")
          .lte("agendamento_data", agora)
          .order("agendamento_data", { ascending: true })
          .limit(1)
          .maybeSingle()
      ).data;

    if (!alvo) return { executou: true, campanha: null };

    const resultado = await processarCampanha(alvo.id);
    return { executou: true, campanha: alvo.id, ...resultado };
  } finally {
    await liberarLock();
  }
}

/* ------------------------------------------------------------------ */
/* Rastreio e descadastro                                              */
/* ------------------------------------------------------------------ */

export async function registrarAbertura(destinatarioId: string) {
  const db = await admin();
  await db
    .from("campaign_recipients")
    .update({ aberto_em: new Date().toISOString() })
    .eq("id", destinatarioId)
    .is("aberto_em", null);
}

export async function registrarClique(destinatarioId: string) {
  const db = await admin();
  const agora = new Date().toISOString();
  await db
    .from("campaign_recipients")
    .update({ clicado_em: agora })
    .eq("id", destinatarioId)
    .is("clicado_em", null);
  await db
    .from("campaign_recipients")
    .update({ aberto_em: agora })
    .eq("id", destinatarioId)
    .is("aberto_em", null);
}

export async function registrarDescadastro(email: string, motivo: string) {
  const db = await admin();
  const alvo = email.trim().toLowerCase();
  await db.from("email_optouts").upsert({ email: alvo, motivo }, { onConflict: "email" });
  await db.from("profiles").update({ status_conta: "descadastrado" }).eq("email", alvo);
}

/* ------------------------------------------------------------------ */
/* Métricas gerais                                                     */
/* ------------------------------------------------------------------ */

export async function metricasGerais() {
  const db = await admin();

  const [{ count: totalClientes }, { count: ativos }, { count: descadastrados }, contatos] =
    await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("profiles").select("id", { count: "exact", head: true }).eq("status_conta", "ativa"),
      db.from("email_optouts").select("email", { count: "exact", head: true }),
      listarContatos(),
    ]);

  const { data: envios } = await db
    .from("campaign_recipients")
    .select("status, aberto_em, clicado_em")
    .limit(20000);

  const enviados = (envios ?? []).filter((e) => e.status === "enviado");
  const abertos = enviados.filter((e) => e.aberto_em).length;
  const cliques = enviados.filter((e) => e.clicado_em).length;

  const { data: recuperados } = await db
    .from("abandoned_orders")
    .select("valor_recuperado_centavos")
    .eq("status_automacao", "recuperado")
    .limit(2000);

  const valorRecuperado = (recuperados ?? []).reduce(
    (t, r) => t + (r.valor_recuperado_centavos ?? 0),
    0,
  );

  const pct = (n: number) => (enviados.length ? Math.round((n / enviados.length) * 1000) / 10 : 0);

  return {
    totalClientes: totalClientes ?? 0,
    clientesAtivos: ativos ?? 0,
    descadastrados: descadastrados ?? 0,
    contatosAlcancaveis: contatos.length,
    emailsEnviados: enviados.length,
    taxaAbertura: pct(abertos),
    taxaCliques: pct(cliques),
    pedidosRecuperados: (recuperados ?? []).length,
    valorRecuperado,
    valorRecuperadoFormatado: formatarBRL(valorRecuperado),
  };
}

export async function painelEmails() {
  const [metricas, campanhas, boasVindas] = await Promise.all([
    metricasGerais(),
    listarCampanhas(),
    lerConfigEmail("boas-vindas"),
  ]);
  return { metricas, campanhas, boasVindas };
}
