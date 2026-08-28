import { PIX, formatarBRL, DIAS_PARA_EXPIRAR } from "./site";
import { gerarPixCopiaECola } from "./pix";

export const ETAPAS = [1, 2, 3] as const;
export type Etapa = (typeof ETAPAS)[number];

/** Minutos após a criação do pedido para disparar cada etapa. */
export const ATRASO_MINUTOS: Record<Etapa, number> = {
  1: 30,
  2: 12 * 60,
  3: 48 * 60,
};

const LOTE = 20;
const LOCK_NOME = "recuperacao-pedidos";
const LOCK_MINUTOS = 5;

const SITE_URL = "https://certidaodeobjetoepe.org";

export type AbandonedOrderRow = {
  id: string;
  pedido_id: string;
  protocolo: string;
  cliente_nome: string | null;
  cliente_email: string;
  valor_total_centavos: number;
  link_pagamento: string | null;
  codigo_pix: string | null;
  data_criacao: string;
  status_automacao: string;
  etapa_1_em: string | null;
  etapa_2_em: string | null;
  etapa_3_em: string | null;
  recuperado_em: string | null;
  valor_recuperado_centavos: number;
  ultimo_erro: string | null;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function pixDoPedido(row: { pix_codigo: string | null; valor_centavos: number; protocolo: string }) {
  return (
    row.pix_codigo ??
    gerarPixCopiaECola({
      chave: PIX.chave,
      nome: PIX.nome,
      cidade: PIX.cidade,
      valorCentavos: row.valor_centavos,
      txid: row.protocolo,
    })
  );
}

export function etapaAtual(row: Pick<AbandonedOrderRow, "etapa_1_em" | "etapa_2_em" | "etapa_3_em">) {
  if (row.etapa_3_em) return 3;
  if (row.etapa_2_em) return 2;
  if (row.etapa_1_em) return 1;
  return 0;
}

export function aplicarVariaveis(
  texto: string,
  vars: { nome_cliente: string; numero_pedido: string; link_pagamento: string; codigo_pix: string },
) {
  return texto
    .replace(/\{\{\s*nome_cliente\s*\}\}/g, vars.nome_cliente)
    .replace(/\{\{\s*numero_pedido\s*\}\}/g, vars.numero_pedido)
    .replace(/\{\{\s*link_pagamento\s*\}\}/g, vars.link_pagamento)
    .replace(/\{\{\s*codigo_pix\s*\}\}/g, vars.codigo_pix);
}

/** Trava de execução: evita duas rodadas simultâneas da rotina. */
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

/** Insere na fila de recuperação os pedidos pendentes que ainda não estão lá. */
export async function sincronizarFila() {
  const db = await admin();
  const { data: pendentes } = await db
    .from("pedidos")
    .select("id, protocolo, nome_parte, email, valor_centavos, pix_codigo, created_at")
    .eq("status", "aguardando_pagamento")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!pendentes?.length) return 0;

  const { data: existentes } = await db
    .from("abandoned_orders")
    .select("pedido_id")
    .in(
      "pedido_id",
      pendentes.map((p) => p.id),
    );

  const jaNaFila = new Set((existentes ?? []).map((e) => e.pedido_id));
  const novos = pendentes
    .filter((p) => !jaNaFila.has(p.id))
    .map((p) => ({
      pedido_id: p.id,
      protocolo: p.protocolo,
      cliente_nome: p.nome_parte,
      cliente_email: p.email,
      valor_total_centavos: p.valor_centavos,
      link_pagamento: `${SITE_URL}/pedido/${p.protocolo}`,
      codigo_pix: pixDoPedido(p),
      data_criacao: p.created_at,
      status_automacao: "pendente",
    }));

  if (!novos.length) return 0;
  const { error } = await db.from("abandoned_orders").insert(novos);
  if (error) {
    console.error("Falha ao enfileirar pedidos abandonados", error);
    return 0;
  }
  return novos.length;
}

/** Reflete no registro de recuperação o status atual do pedido (pago/cancelado/expirado). */
async function sincronizarStatus() {
  const db = await admin();
  const { data: emAndamento } = await db
    .from("abandoned_orders")
    .select("id, pedido_id, valor_total_centavos, status_automacao")
    .in("status_automacao", ["pendente", "etapa_1_enviada", "etapa_2_enviada", "etapa_3_enviada"])
    .limit(200);

  if (!emAndamento?.length) return;

  const { data: pedidos } = await db
    .from("pedidos")
    .select("id, status, pago_em, valor_centavos")
    .in(
      "id",
      emAndamento.map((r) => r.pedido_id),
    );

  const porId = new Map((pedidos ?? []).map((p) => [p.id, p]));

  for (const r of emAndamento) {
    const p = porId.get(r.pedido_id);
    if (!p) continue;
    if (p.status === "pago") {
      await db
        .from("abandoned_orders")
        .update({
          status_automacao: "recuperado",
          recuperado_em: p.pago_em ?? new Date().toISOString(),
          valor_recuperado_centavos: p.valor_centavos,
        })
        .eq("id", r.id);
    } else if (p.status === "cancelado" || p.status === "expirado") {
      await db.from("abandoned_orders").update({ status_automacao: "cancelado" }).eq("id", r.id);
    }
  }
}

async function configEtapa(etapa: Etapa) {
  const db = await admin();
  const { data } = await db
    .from("email_sequencia_config")
    .select("etapa, assunto, corpo, ativo")
    .eq("etapa", etapa)
    .maybeSingle();
  return data;
}

/** Envia o e-mail de uma etapa e marca o registro. */
export async function enviarEtapa(row: AbandonedOrderRow, etapa: Etapa, marcar = true) {
  const db = await admin();
  const config = await configEtapa(etapa);
  if (!config || !config.ativo) return { enviado: false, motivo: "etapa_inativa" as const };

  const vars = {
    nome_cliente: row.cliente_nome?.split(" ")[0] || "cliente",
    numero_pedido: row.protocolo,
    link_pagamento: row.link_pagamento ?? `${SITE_URL}/pedido/${row.protocolo}`,
    codigo_pix: row.codigo_pix ?? "",
  };

  const assunto = aplicarVariaveis(config.assunto, vars);
  const corpo = aplicarVariaveis(config.corpo, vars);

  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const resultado = await sendTemplateEmail("recuperacao-etapa", row.cliente_email, {
    idempotencyKey: marcar ? `recuperacao-${row.protocolo}-etapa-${etapa}` : undefined,
    templateData: { assunto, corpo, titulo: assunto },
  });

  if (marcar) {
    const agora = new Date().toISOString();
    await db
      .from("abandoned_orders")
      .update({
        status_automacao: `etapa_${etapa}_enviada`,
        ultimo_erro: null,
        ...(etapa === 1 ? { etapa_1_em: agora } : etapa === 2 ? { etapa_2_em: agora } : { etapa_3_em: agora }),
      })
      .eq("id", row.id);
  }

  return { enviado: resultado.sent, motivo: resultado.sent ? null : resultado.reason };
}

/**
 * Rodada da automação: sincroniza fila e status e dispara a etapa devida.
 * Protegida por trava e limitada a um lote por execução.
 */
export async function processarRecuperacao() {
  const ok = await adquirirLock();
  if (!ok) return { executou: false, enviados: 0, enfileirados: 0 };

  try {
    const enfileirados = await sincronizarFila();
    await sincronizarStatus();

    const db = await admin();
    const { data: fila } = await db
      .from("abandoned_orders")
      .select("*")
      .in("status_automacao", ["pendente", "etapa_1_enviada", "etapa_2_enviada"])
      .order("data_criacao", { ascending: true })
      .limit(LOTE);

    let enviados = 0;
    for (const row of (fila ?? []) as AbandonedOrderRow[]) {
      const idade = Date.now() - new Date(row.data_criacao).getTime();
      const dias = idade / (24 * 60 * 60 * 1000);
      if (dias >= DIAS_PARA_EXPIRAR) {
        await db.from("abandoned_orders").update({ status_automacao: "cancelado" }).eq("id", row.id);
        continue;
      }

      const proxima = (etapaAtual(row) + 1) as Etapa;
      if (proxima > 3) continue;
      if (idade < ATRASO_MINUTOS[proxima] * 60 * 1000) continue;

      try {
        const r = await enviarEtapa(row, proxima);
        if (r.enviado) enviados += 1;
      } catch (e) {
        const mensagem = e instanceof Error ? e.message : String(e);
        console.error("Falha ao enviar etapa de recuperação", row.protocolo, proxima, mensagem);
        await db.from("abandoned_orders").update({ ultimo_erro: mensagem }).eq("id", row.id);
        const status = (e as { status?: number } | null)?.status;
        if (status === 402 || status === 403 || status === 429) break;
      }
    }

    return { executou: true, enviados, enfileirados };
  } finally {
    await liberarLock();
  }
}

export type MetricasRecuperacao = {
  pendentes: number;
  emRecuperacao: number;
  recuperados: number;
  taxaRecuperacao: number;
  valorRecuperado: number;
  valorRecuperadoFormatado: string;
};

export async function listarRecuperacao() {
  const db = await admin();
  await sincronizarFila();
  await sincronizarStatus();

  const { data } = await db
    .from("abandoned_orders")
    .select("*")
    .order("data_criacao", { ascending: false })
    .limit(300);

  const linhas = ((data ?? []) as AbandonedOrderRow[]).map((r) => ({
    id: r.id,
    protocolo: r.protocolo,
    clienteNome: r.cliente_nome,
    clienteEmail: r.cliente_email,
    valorCentavos: r.valor_total_centavos,
    valorFormatado: formatarBRL(r.valor_total_centavos),
    linkPagamento: r.link_pagamento,
    dataCriacao: r.data_criacao,
    status: r.status_automacao,
    etapa: etapaAtual(r),
    ultimoEnvio: r.etapa_3_em ?? r.etapa_2_em ?? r.etapa_1_em,
    recuperadoEm: r.recuperado_em,
    ultimoErro: r.ultimo_erro,
  }));

  const emAndamento = linhas.filter((l) =>
    ["pendente", "etapa_1_enviada", "etapa_2_enviada", "etapa_3_enviada"].includes(l.status),
  );
  const recuperados = linhas.filter((l) => l.status === "recuperado");
  const base = emAndamento.length + recuperados.length;

  const valorRecuperado = recuperados.reduce((t, l) => t + l.valorCentavos, 0);

  const metricas: MetricasRecuperacao = {
    pendentes: emAndamento.length,
    emRecuperacao: emAndamento.filter((l) => l.etapa > 0).length,
    recuperados: recuperados.length,
    taxaRecuperacao: base ? Math.round((recuperados.length / base) * 1000) / 10 : 0,
    valorRecuperado,
    valorRecuperadoFormatado: formatarBRL(valorRecuperado),
  };

  return { linhas, metricas };
}

export type LinhaRecuperacao = Awaited<ReturnType<typeof listarRecuperacao>>["linhas"][number];

export async function buscarRegistro(id: string) {
  const db = await admin();
  const { data } = await db.from("abandoned_orders").select("*").eq("id", id).maybeSingle();
  return (data as AbandonedOrderRow) ?? null;
}

export async function reenviarEtapaManual(id: string) {
  const row = await buscarRegistro(id);
  if (!row) throw new Error("Registro não encontrado.");
  const etapa = Math.min(Math.max(etapaAtual(row), 1), 3) as Etapa;
  const marcarNova = etapaAtual(row) === 0;
  await enviarEtapa(row, marcarNova ? 1 : etapa, marcarNova);
  return { ok: true };
}

export async function marcarComoPago(id: string) {
  const db = await admin();
  const row = await buscarRegistro(id);
  if (!row) throw new Error("Registro não encontrado.");

  await db
    .from("pedidos")
    .update({ status: "pago", pago_em: new Date().toISOString() })
    .eq("id", row.pedido_id);

  await db
    .from("abandoned_orders")
    .update({
      status_automacao: "recuperado",
      recuperado_em: new Date().toISOString(),
      valor_recuperado_centavos: row.valor_total_centavos,
    })
    .eq("id", id);

  return { ok: true };
}

export async function cancelarRecuperacao(id: string) {
  const db = await admin();
  await db.from("abandoned_orders").update({ status_automacao: "cancelado" }).eq("id", id);
  return { ok: true };
}

export async function lerConfig() {
  const db = await admin();
  const { data } = await db
    .from("email_sequencia_config")
    .select("etapa, assunto, corpo, ativo")
    .order("etapa");
  return data ?? [];
}

export async function salvarConfig(input: {
  etapa: Etapa;
  assunto: string;
  corpo: string;
  ativo: boolean;
}) {
  const db = await admin();
  const { error } = await db
    .from("email_sequencia_config")
    .update({ assunto: input.assunto, corpo: input.corpo, ativo: input.ativo })
    .eq("etapa", input.etapa);
  if (error) throw new Error("Não foi possível salvar o texto do e-mail.");
  return { ok: true };
}

export async function enviarTeste(etapa: Etapa, email: string) {
  const fake: AbandonedOrderRow = {
    id: "teste",
    pedido_id: "teste",
    protocolo: "COP2026TESTE01",
    cliente_nome: "Cliente Exemplo",
    cliente_email: email,
    valor_total_centavos: 29700,
    link_pagamento: `${SITE_URL}/pedido/COP2026TESTE01`,
    codigo_pix: "00020126...EXEMPLO",
    data_criacao: new Date().toISOString(),
    status_automacao: "pendente",
    etapa_1_em: null,
    etapa_2_em: null,
    etapa_3_em: null,
    recuperado_em: null,
    valor_recuperado_centavos: 0,
    ultimo_erro: null,
  };
  await enviarEtapa(fake, etapa, false);
  return { ok: true };
}
