import { AGENDA_PADRAO, CANAIS, utmUrl, type Agenda, type Nicho } from "@/lib/conteudo/tipos";
import { promptConteudo } from "@/lib/conteudo/prompts";
import { publicarNoCanal } from "@/lib/conteudo/adapters";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function log(
  nivel: string,
  mensagem: string,
  extra: { jobId?: string; itemId?: string; canal?: string; payload?: unknown } = {},
) {
  const db = await admin();
  await db.from("publication_logs").insert({
    nivel,
    mensagem,
    job_id: extra.jobId ?? null,
    content_item_id: extra.itemId ?? null,
    canal: extra.canal ?? null,
    payload: (extra.payload ?? {}) as never,
  });
}

/* ---------------------------------- config --------------------------------- */

export async function lerAgenda(): Promise<Agenda> {
  const db = await admin();
  const { data } = await db.from("content_config").select("valor").eq("chave", "agenda").maybeSingle();
  return { ...AGENDA_PADRAO, ...((data?.valor as Partial<Agenda>) ?? {}) };
}

export async function salvarAgenda(agenda: Agenda) {
  const db = await admin();
  await db
    .from("content_config")
    .upsert({ chave: "agenda", valor: agenda as never, atualizado_em: new Date().toISOString() });
  await log("info", "Agenda editorial atualizada", { payload: agenda });
  return agenda;
}

/* ------------------------------------ IA ----------------------------------- */

const MODELO = "google/gemini-3.8-flash";

interface PacoteIA {
  titulo: string;
  h1: string;
  slug: string;
  meta_description: string;
  resumo: string;
  blocos: unknown[];
  faq: { q: string; a: string }[];
  canais: Record<string, unknown>;
}

function limparJson(texto: string) {
  const t = texto.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const ini = t.indexOf("{");
  const fim = t.lastIndexOf("}");
  return ini >= 0 && fim > ini ? t.slice(ini, fim + 1) : t;
}

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function chamarIA(prompt: string): Promise<PacoteIA> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY ausente no ambiente do servidor.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODELO,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const corpo = await res.text();
    if (res.status === 429) throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados no workspace.");
    throw new Error(`Falha na geração de conteúdo [${res.status}]: ${corpo.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const texto = json.choices?.[0]?.message?.content ?? "";
  if (!texto) throw new Error("A IA respondeu vazio.");
  return JSON.parse(limparJson(texto)) as PacoteIA;
}

/* ---------------------------------- temas ---------------------------------- */

export async function listarTemas() {
  const db = await admin();
  const { data, error } = await db
    .from("content_topics")
    .select("*")
    .order("nicho")
    .order("prioridade");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function alternarTema(id: string, ativo: boolean) {
  const db = await admin();
  const { error } = await db.from("content_topics").update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

async function proximoTema(nicho: Nicho) {
  const db = await admin();
  const { data } = await db
    .from("content_topics")
    .select("*")
    .eq("nicho", nicho)
    .eq("ativo", true)
    .order("ultimo_uso_em", { ascending: true, nullsFirst: true })
    .order("prioridade")
    .limit(1);
  return data?.[0] ?? null;
}

/* -------------------------------- conteúdos -------------------------------- */

export async function gerarConteudo(opts: { topicId?: string; nicho?: Nicho; criadoPor?: string }) {
  const db = await admin();

  let tema = null as Awaited<ReturnType<typeof proximoTema>>;
  if (opts.topicId) {
    const { data } = await db.from("content_topics").select("*").eq("id", opts.topicId).maybeSingle();
    tema = data;
  } else if (opts.nicho) {
    tema = await proximoTema(opts.nicho);
  }
  if (!tema) throw new Error("Nenhum tema disponível para gerar conteúdo.");

  const pacote = await chamarIA(
    promptConteudo(tema.nicho as Nicho, tema.titulo, tema.angulo, tema.palavra_chave),
  );

  let slug = slugify(pacote.slug || pacote.titulo || tema.titulo);
  const { data: existe } = await db.from("content_items").select("id").eq("slug", slug).maybeSingle();
  if (existe) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { data: item, error } = await db
    .from("content_items")
    .insert({
      topic_id: tema.id,
      nicho: tema.nicho,
      status: "draft",
      slug,
      titulo: pacote.titulo || tema.titulo,
      meta_description: (pacote.meta_description ?? "").slice(0, 200),
      resumo: pacote.resumo ?? "",
      blocos: (pacote.blocos ?? []) as never,
      faq: (pacote.faq ?? []) as never,
      canais: {
        ...(pacote.canais ?? {}),
        h1: pacote.h1 ?? pacote.titulo,
        links: Object.fromEntries(CANAIS.map((c) => [c.id, utmUrl(c.id, tema.nicho)])),
      } as never,
      modelo: MODELO,
      criado_por: opts.criadoPor ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await db.from("content_topics").update({ ultimo_uso_em: new Date().toISOString() }).eq("id", tema.id);
  await log("info", `Conteúdo gerado: ${item.titulo}`, { itemId: item.id });
  return item;
}

/** Instante ISO de uma data (AAAA-MM-DD) + horário (HH:MM) no fuso de Brasília. */
function instanteBrasilia(data: string, horario: string) {
  const [h = "08", m = "00"] = (horario || "08:00").split(":");
  return new Date(`${data}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00-03:00`).toISOString();
}

/** Gera e agenda as pautas pendentes de uma campanha do calendário editorial. */
export async function gerarCampanha(campanha: string, limite = 3) {
  const db = await admin();
  const { promptPauta } = await import("@/lib/conteudo/prompts");

  const { data: pautas, error } = await db
    .from("content_topics")
    .select("*")
    .eq("campanha", campanha)
    .eq("ativo", true)
    .order("data_publicacao")
    .order("horario");
  if (error) throw new Error(error.message);

  const { data: feitos } = await db
    .from("content_items")
    .select("topic_id")
    .in("topic_id", (pautas ?? []).map((p) => p.id));
  const prontos = new Set((feitos ?? []).map((f) => f.topic_id));
  const pendentes = (pautas ?? []).filter((p) => !prontos.has(p.id)).slice(0, limite);

  const criados: { titulo: string; slug: string; agendado: string }[] = [];
  const erros: { titulo: string; erro: string }[] = [];

  for (const p of pendentes) {
    try {
      const pacote = await chamarIA(
        promptPauta({
          nicho: p.nicho as Nicho,
          titulo: p.titulo,
          angulo: p.angulo,
          palavra_chave: p.palavra_chave,
          palavras_secundarias: p.palavras_secundarias,
          objetivo: p.objetivo,
          slug_sugerido: p.slug_sugerido,
          meta_title: p.meta_title,
          meta_description: p.meta_description,
        }),
      );

      let slug = slugify(p.slug_sugerido || pacote.slug || pacote.titulo);
      const { data: existe } = await db.from("content_items").select("id").eq("slug", slug).maybeSingle();
      if (existe) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

      const quando = instanteBrasilia(p.data_publicacao ?? "", p.horario ?? "08:00");

      const { data: item, error: erroInsert } = await db
        .from("content_items")
        .insert({
          topic_id: p.id,
          nicho: p.nicho,
          status: "scheduled",
          slug,
          titulo: (pacote.titulo || p.meta_title || p.titulo).slice(0, 120),
          meta_description: (pacote.meta_description || p.meta_description || "").slice(0, 200),
          resumo: pacote.resumo ?? "",
          blocos: (pacote.blocos ?? []) as never,
          faq: (pacote.faq ?? []) as never,
          canais: {
            ...(pacote.canais ?? {}),
            h1: pacote.h1 ?? p.titulo,
            pauta: p.titulo,
            objetivo: p.objetivo,
            palavra_chave: p.palavra_chave,
            palavras_secundarias: p.palavras_secundarias ?? [],
            cta: "Precisa de informações oficiais sobre um processo? Solicite sua Certidão de Objeto e Pé online, de qualquer lugar do Brasil. Acesse: https://certidaodeobjetoepe.org",
            links: Object.fromEntries(CANAIS.map((c) => [c.id, utmUrl(c.id, p.nicho)])),
          } as never,
          modelo: MODELO,
          agendado_para: quando,
        })
        .select()
        .single();
      if (erroInsert) throw new Error(erroInsert.message);

      await db.from("content_topics").update({ ultimo_uso_em: new Date().toISOString() }).eq("id", p.id);
      // Calendário editorial: o item fica agendado para revisão, SEM job de
      // publicação. Nada é publicado automaticamente (nem no blog, nem em
      // redes sociais) até que a equipe publique pelo painel.
      await log("info", `Pauta gerada e agendada: ${p.titulo}`, { itemId: item.id });
      criados.push({ titulo: item.titulo, slug, agendado: quando });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro desconhecido";
      erros.push({ titulo: p.titulo, erro: msg });
      await log("error", `Falha ao gerar pauta "${p.titulo}": ${msg}`);
    }
  }

  const restantes = (pautas ?? []).length - prontos.size - criados.length;
  return { campanha, criados, erros, restantes: Math.max(0, restantes) };
}

export async function listarItens(filtro: { status?: string; nicho?: string } = {}) {

  const db = await admin();
  let q = db.from("content_items").select("*").order("created_at", { ascending: false }).limit(100);
  if (filtro.status) q = q.eq("status", filtro.status);
  if (filtro.nicho) q = q.eq("nicho", filtro.nicho);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function aprovarItem(id: string) {
  const db = await admin();
  const { error } = await db.from("content_items").update({ status: "approved" }).eq("id", id);
  if (error) throw new Error(error.message);
  await log("info", "Conteúdo aprovado", { itemId: id });
  return { ok: true };
}

export async function excluirItem(id: string) {
  const db = await admin();
  const { error } = await db.from("content_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* ----------------------------------- fila ---------------------------------- */

export async function agendarItem(id: string, quando: string, canais: string[]) {
  const db = await admin();
  const { data: item } = await db.from("content_items").select("*").eq("id", id).maybeSingle();
  if (!item) throw new Error("Conteúdo não encontrado.");

  const jobs = canais.map((canal) => ({
    content_item_id: id,
    canal,
    status: "scheduled",
    agendado_para: quando,
    idempotency_key: `${id}:${canal}`,
  }));

  const { error } = await db
    .from("publication_jobs")
    .upsert(jobs as never, { onConflict: "idempotency_key", ignoreDuplicates: true });
  if (error) throw new Error(error.message);

  await db.from("content_items").update({ status: "scheduled", agendado_para: quando }).eq("id", id);
  await log("info", `Agendado para ${new Date(quando).toLocaleString("pt-BR")}`, { itemId: id });
  return { ok: true, jobs: jobs.length };
}

export async function listarFila() {
  const db = await admin();
  const { data, error } = await db
    .from("publication_jobs")
    .select("*, content_items(titulo, slug, nicho)")
    .order("agendado_para", { ascending: true })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listarLogs() {
  const db = await admin();
  const { data } = await db
    .from("publication_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);
  return data ?? [];
}

async function executarJob(jobId: string) {
  const db = await admin();
  const { data: job } = await db.from("publication_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, mensagem: "Job inexistente." };
  if (job.status === "published") return { ok: true, mensagem: "Já publicado (idempotente)." };

  await db
    .from("publication_jobs")
    .update({ status: "publishing", tentativas: job.tentativas + 1, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  const { data: item } = await db
    .from("content_items")
    .select("*")
    .eq("id", job.content_item_id)
    .maybeSingle();
  if (!item) {
    await db.from("publication_jobs").update({ status: "failed", ultimo_erro: "Conteúdo removido" }).eq("id", jobId);
    return { ok: false, mensagem: "Conteúdo removido." };
  }

  const { data: conta } = await db
    .from("social_accounts")
    .select("conectado, secret_esperado")
    .eq("canal", job.canal)
    .maybeSingle();

  let resultado;
  try {
    resultado = await publicarNoCanal(job.canal, {
      itemId: item.id,
      slug: item.slug,
      titulo: item.titulo,
      nicho: item.nicho,
      canais: (item.canais ?? {}) as Record<string, unknown>,
      link: utmUrl(job.canal, item.nicho),
      conta: conta ?? null,
    });
  } catch (e) {
    resultado = { ok: false, mensagem: e instanceof Error ? e.message : "Erro desconhecido" };
  }

  const status = resultado.ok ? "published" : resultado.skipped ? "skipped" : "failed";
  await db
    .from("publication_jobs")
    .update({
      status,
      ultimo_erro: resultado.ok ? null : resultado.mensagem,
      url_publicada: resultado.url ?? null,
      publicado_em: resultado.ok ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  await log(resultado.ok ? "info" : resultado.skipped ? "warn" : "error", resultado.mensagem, {
    jobId,
    itemId: item.id,
    canal: job.canal,
  });

  if (!resultado.ok && !resultado.skipped) {
    await db.from("content_items").update({ status: "failed" }).eq("id", item.id);
  }
  return { ok: resultado.ok, mensagem: resultado.mensagem };
}

export async function processarFila(limite = 10) {
  const db = await admin();
  const { data: jobs } = await db
    .from("publication_jobs")
    .select("id")
    .eq("status", "scheduled")
    .lte("agendado_para", new Date().toISOString())
    .order("agendado_para")
    .limit(limite);

  const resultados: { id: string; ok: boolean; mensagem: string }[] = [];
  for (const j of jobs ?? []) {
    const r = await executarJob(j.id);
    resultados.push({ id: j.id, ...r });
  }
  return resultados;
}

export async function reprocessarJob(jobId: string) {
  const db = await admin();
  await db.from("publication_jobs").update({ status: "scheduled", ultimo_erro: null }).eq("id", jobId);
  return executarJob(jobId);
}

/* --------------------------------- calendário ------------------------------- */

function instanteDoDia(horario: string, timezone: string, dia = new Date()) {
  const [h = "8", m = "0"] = horario.split(":");
  const dataLocal = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(dia);
  // -03:00 é o offset fixo de America/Sao_Paulo desde o fim do horário de verão.
  return new Date(`${dataLocal}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00-03:00`).toISOString();
}

/** Gera (e agenda, fora do modo de teste) os dois conteúdos do dia. */
export async function executarProximoCiclo(opts: { forcar?: boolean; criadoPor?: string } = {}) {
  const db = await admin();
  const agenda = await lerAgenda();
  if (!agenda.ativo && !opts.forcar) return { executado: false, motivo: "Agenda desativada." };

  const inicioDia = instanteDoDia("00:00", agenda.timezone);
  const planos: { nicho: Nicho; quando: string }[] = [
    { nicho: "caminhoneiros", quando: instanteDoDia(agenda.horarioCaminhoneiros, agenda.timezone) },
    { nicho: "motoristas_app", quando: instanteDoDia(agenda.horarioMotoristas, agenda.timezone) },
  ];

  const criados: { nicho: string; titulo: string; slug: string; agendado?: string }[] = [];
  for (const plano of planos) {
    const { data: jaTem } = await db
      .from("content_items")
      .select("id")
      .eq("nicho", plano.nicho)
      .gte("created_at", inicioDia)
      .limit(1);
    if (jaTem?.length && !opts.forcar) continue;

    const item = await gerarConteudo({ nicho: plano.nicho, criadoPor: opts.criadoPor });
    if (!agenda.modoTeste) {
      await aprovarItem(item.id);
      await agendarItem(item.id, plano.quando, ["blog"]);
    }
    criados.push({
      nicho: plano.nicho,
      titulo: item.titulo,
      slug: item.slug,
      ...(agenda.modoTeste ? {} : { agendado: plano.quando }),
    });
  }

  const publicacoes = agenda.modoTeste ? [] : await processarFila(10);
  return { executado: true, modoTeste: agenda.modoTeste, criados, publicacoes };
}

/* --------------------------------- dashboard -------------------------------- */

export async function painelConteudo() {
  const db = await admin();
  const agora = new Date().toISOString();

  const [agenda, itens, fila, logs, contas, metricas] = await Promise.all([
    lerAgenda(),
    listarItens(),
    listarFila(),
    listarLogs(),
    db.from("social_accounts").select("*").order("canal"),
    db.from("content_metrics").select("*").order("coletado_em", { ascending: false }).limit(50),
  ]);

  const contagem = itens.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    agenda,
    itens,
    fila,
    logs,
    contas: contas.data ?? [],
    metricas: metricas.data ?? [],
    resumo: {
      total: itens.length,
      porStatus: contagem,
      proximos: fila.filter((j) => j.status === "scheduled" && j.agendado_para >= agora).length,
      falhas: fila.filter((j) => j.status === "failed").length,
      naoPublicaveis: fila.filter((j) => j.status === "skipped").length,
    },
  };
}
