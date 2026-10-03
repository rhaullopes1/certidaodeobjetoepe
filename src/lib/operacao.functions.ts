import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CHECKLIST_MANUAL, ehAdministrativo, ehOperador, ETAPAS_OPERACAO, MOTIVOS_PENDENCIA } from "./papeis";

type Ctx = { supabase: SupabaseClient<Database>; userId: string };

async function papeis(ctx: Ctx) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error("Não foi possível verificar o acesso.");
  return (data ?? []).map((p) => p.role as string);
}
export async function exigirEquipeOperacao(ctx: Ctx) {
  if (!ehAdministrativo(await papeis(ctx))) throw new Error("Acesso restrito à equipe.");
}
export async function exigirOperador(ctx: Ctx) {
  if (!ehOperador(await papeis(ctx))) throw new Error("Acesso restrito ao operador.");
}

const etapas = ETAPAS_OPERACAO.map((e) => e.valor) as [string, ...string[]];
const idAtrib = z.object({ id: z.string().uuid() });

async function auditar(ctx: Ctx, pedidoId: string, status: string, observacao: string | null, observacaoInterna?: string | null) {
  await ctx.supabase.from("pedido_andamentos").insert({
    pedido_id: pedidoId,
    status: `operacao_${status}`,
    observacao,
    observacao_interna: observacaoInterna ?? null,
    autor_id: ctx.userId,
  });
}

/* ---------------- OPERADOR ----------------
 * Toda leitura do operador passa por RPCs SECURITY DEFINER com projeção explícita.
 * Nunca selecionar tabelas diretamente aqui: nada financeiro/administrativo pode sair.
 */

export const minhaFilaOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirOperador(context);
    const { data, error } = await context.supabase.rpc("operador_minha_fila");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const detalheOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idAtrib.parse(d))
  .handler(async ({ context, data }) => {
    await exigirOperador(context);
    const [det, hist, anx] = await Promise.all([
      context.supabase.rpc("operador_pedido_detalhe", { p_atribuicao: data.id }),
      context.supabase.rpc("operador_historico", { p_atribuicao: data.id }),
      context.supabase.rpc("operador_anexos", { p_atribuicao: data.id }),
    ]);
    if (det.error) throw new Error(det.error.message);
    const pedido = det.data?.[0];
    if (!pedido) throw new Error("Atribuição não encontrada.");
    const anexos = anx.data ?? [];
    const meusPdfs = anexos.filter((a) => a.meu);
    return { pedido, historico: hist.data ?? [], anexos, meusPdfs };
  });

export const atualizarEtapaOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["em_andamento", "aguardando_tribunal", "documento_recebido", "concluido"]),
        observacao: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await exigirOperador(context);
    const { error } = await context.supabase.rpc("operador_atualizar_etapa", {
      p_atribuicao: data.id,
      p_status: data.status,
      p_observacao: data.observacao ?? undefined,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const motivos = MOTIVOS_PENDENCIA.map((m) => m.valor) as [string, ...string[]];
export const registrarPendenciaOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), motivo: z.enum(motivos), observacao: z.string().max(2000).optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await exigirOperador(context);
    const { error } = await context.supabase.rpc("operador_registrar_pendencia", {
      p_atribuicao: data.id,
      p_motivo: data.motivo,
      p_observacao: data.observacao ?? undefined,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resolverPendenciaOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), observacao: z.string().max(2000).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await exigirOperador(context);
    const { error } = await context.supabase.rpc("operador_resolver_pendencia", {
      p_atribuicao: data.id,
      p_observacao: data.observacao ?? undefined,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const itensChecklist = CHECKLIST_MANUAL.map((c) => c.chave) as [string, ...string[]];
export const marcarChecklistOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), item: z.enum(itensChecklist), marcado: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await exigirOperador(context);
    const { error } = await context.supabase.rpc("operador_salvar_checklist", {
      p_atribuicao: data.id,
      p_item: data.item,
      p_marcado: data.marcado,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const salvarNotaOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), nota: z.string().max(4000) }).parse(d))
  .handler(async ({ context, data }) => {
    await exigirOperador(context);
    const { error } = await context.supabase.rpc("operador_salvar_nota", { p_atribuicao: data.id, p_nota: data.nota });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const meuHistoricoOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirOperador(context);
    const { data, error } = await context.supabase.rpc("operador_meu_historico");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ---------------- ADMINISTRAÇÃO ---------------- */

export const listarOperadores = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipeOperacao(context);
    const { data, error } = await context.supabase.rpc("listar_operadores_certidao");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const atribuirOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ pedidoId: z.string().uuid(), operadorId: z.string().uuid(), observacao: z.string().max(2000).optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await exigirEquipeOperacao(context);
    const { data: pedido } = await context.supabase.from("pedidos").select("id, status").eq("id", data.pedidoId).maybeSingle();
    if (!pedido) throw new Error("Pedido não encontrado.");
    if (!["pago", "em_analise", "protocolado"].includes(pedido.status))
      throw new Error("Só pedidos pagos e não encerrados podem ir para operação.");
    const { error } = await context.supabase.from("operador_pedidos").insert({
      pedido_id: data.pedidoId,
      operador_id: data.operadorId,
      atribuido_por: context.userId,
      observacao_operador: data.observacao?.trim() || null,
    });
    if (error) {
      if (error.code === "23505") throw new Error("Este pedido já está em operação.");
      throw new Error(error.message);
    }
    await auditar(context, data.pedidoId, "atribuido", "Enviado para operação");
    return { ok: true };
  });

export const atribuicoesDoPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ pedidoId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await exigirEquipeOperacao(context);
    const { data: lista, error } = await context.supabase
      .from("operador_pedidos")
      .select("*")
      .eq("pedido_id", data.pedidoId)
      .order("atribuido_em", { ascending: false });
    if (error) throw new Error(error.message);
    return lista ?? [];
  });

export const painelOperacaoAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipeOperacao(context);
    const { data, error } = await context.supabase
      .from("operador_pedidos")
      .select("*, pedidos(protocolo, numero_processo, nome_parte, status)")
      .order("atribuido_em", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    const pedidoIds = [...new Set((data ?? []).map((a) => a.pedido_id))];
    const ultimos = new Map<string, { status: string; created_at: string }>();
    if (pedidoIds.length) {
      const { data: and } = await context.supabase
        .from("pedido_andamentos")
        .select("pedido_id, status, created_at")
        .in("pedido_id", pedidoIds)
        .like("status", "operacao_%")
        .order("created_at", { ascending: false });
      for (const a of and ?? []) if (!ultimos.has(a.pedido_id)) ultimos.set(a.pedido_id, a);
    }
    const { data: ops } = await context.supabase.rpc("listar_operadores_certidao");
    const nomes = new Map((ops ?? []).map((o) => [o.id, o.nome || o.email || "Operador"]));
    return (data ?? []).map((a) => ({
      ...a,
      operador_nome: nomes.get(a.operador_id) ?? "Operador",
      ultimo_andamento: ultimos.get(a.pedido_id) ?? null,
    }));
  });

export const reatribuirOperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), operadorId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await exigirEquipeOperacao(context);
    const { data: a, error } = await context.supabase
      .from("operador_pedidos")
      .update({ operador_id: data.operadorId, status_operacao: "atribuido", atribuido_em: new Date().toISOString(), atribuido_por: context.userId })
      .eq("id", data.id)
      .is("validado_em", null)
      .neq("status_operacao", "devolvido")
      .select("pedido_id")
      .maybeSingle();
    if (error || !a) throw new Error(error?.message ?? "Atribuição não está ativa.");
    await auditar(context, a.pedido_id, "atribuido", "Reatribuído para outro operador");
    return { ok: true };
  });

export const devolverOperacaoAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), observacao: z.string().max(2000).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await exigirEquipeOperacao(context);
    const { data: a, error } = await context.supabase
      .from("operador_pedidos")
      .update({ status_operacao: "devolvido", devolvido_em: new Date().toISOString(), observacao_admin: data.observacao?.trim() || null })
      .eq("id", data.id)
      .is("validado_em", null)
      .select("pedido_id")
      .maybeSingle();
    if (error || !a) throw new Error(error?.message ?? "Atribuição não encontrada.");
    // O texto da administração fica só em observacao_interna (nunca chega ao operador).
    await auditar(context, a.pedido_id, "devolvido", "Recolhido pela administração", data.observacao?.trim() || null);
    return { ok: true };
  });

export const validarOperacaoAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idAtrib.parse(d))
  .handler(async ({ context, data }) => {
    await exigirEquipeOperacao(context);
    const agora = new Date().toISOString();
    const { data: a, error } = await context.supabase
      .from("operador_pedidos")
      .update({ validado_em: agora, validado_por: context.userId })
      .eq("id", data.id)
      .is("validado_em", null)
      .eq("status_operacao", "concluido")
      .select("pedido_id")
      .maybeSingle();
    if (error || !a) throw new Error(error?.message ?? "Só é possível validar uma atribuição concluída pelo operador.");
    await auditar(context, a.pedido_id, "validado", "Conclusão validada pela administração");
    return { ok: true };
  });
