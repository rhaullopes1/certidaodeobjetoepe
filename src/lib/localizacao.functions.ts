import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import { analisarNup } from "./cnj";
import { decodificarPartes } from "./cnj.functions";
import { colunasLocalizacao, mesclarLocalizacao, type ColunasPedidoLocalizacao } from "./localizacao";
import type { Database, Json } from "@/integrations/supabase/types";

const COLS =
  "id, numero_processo, tribunal_sigla, tribunal_nome, segmento_judiciario, uf_processo, cidade_processo, comarca_processo, foro, codigo_origem_cnj, vara, unidade_judiciaria, sistema_processual, processo_fonte, processo_confianca, processo_dados";

async function exigirEquipe(supabase: SupabaseClient<Database>, userId: string) {
  const { data: papeis } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!papeis || papeis.length === 0) throw new Error("Acesso restrito à equipe.");
}

/** Reidentifica um pedido só pela tabela CNJ (sem chamada externa). Retorna se algo mudou. */
async function reidentificarPedido(
  supabase: SupabaseClient<Database>,
  pedido: ColunasPedidoLocalizacao & { id: string; numero_processo: string },
  extra: ColunasPedidoLocalizacao = {},
) {
  const partes = analisarNup(pedido.numero_processo);
  if (!partes) return { mudou: false, reconhecido: false };
  const dec = await decodificarPartes(partes);
  const novo = mesclarLocalizacao(pedido, colunasLocalizacao(dec));
  const final = { ...novo, ...extra };
  const chaves = Object.keys(final).filter((k) => k !== "processo_dados") as (keyof typeof final)[];
  const mudou =
    Object.keys(extra).length > 0 ||
    chaves.some((k) => (final[k] ?? null) !== ((pedido as Record<string, unknown>)[k] ?? null)) ||
    !(pedido.processo_dados as Record<string, unknown> | null)?.["cnj"];
  if (mudou) {
    const { error } = await supabase.from("pedidos").update(final).eq("id", pedido.id);
    if (error) throw new Error("Não foi possível salvar a localização.");
  }
  return { mudou, reconhecido: dec.reconhecido };
}

/**
 * Recalcula a localização de um pedido (tabela CNJ) e, se pedido, consulta o DataJud —
 * única fonte automática para vara/unidade. Somente equipe.
 */
export const atualizarLocalizacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { pedidoId: string; consultarDatajud?: boolean }) => ({
    pedidoId: String(i?.pedidoId ?? ""),
    consultarDatajud: Boolean(i?.consultarDatajud),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);

    const { data: pedido, error } = await supabase
      .from("pedidos")
      .select(COLS)
      .eq("id", data.pedidoId)
      .maybeSingle();
    if (error || !pedido) throw new Error("Pedido não encontrado.");

    let datajudStatus: string | null = null;
    const extra: ColunasPedidoLocalizacao = {};
    const partes = analisarNup(pedido.numero_processo);
    const sigla = pedido.tribunal_sigla ?? (partes ? (await decodificarPartes(partes)).tribunalSigla : null);

    if (data.consultarDatajud && sigla) {
      const { consultarDatajud } = await import("./datajud.server");
      const r = await consultarDatajud(pedido.numero_processo, sigla);
      datajudStatus = r.status;
      extra.processo_dados = {
        ...((pedido.processo_dados as Record<string, Json>) ?? {}),
        ...(partes ? {} : {}),
        datajud: r as unknown as Json,
      };
      if (r.status === "ok" && r.orgaoJulgador) {
        extra.vara = r.orgaoJulgador;
        extra.unidade_judiciaria = r.orgaoJulgador;
        if (r.sistema) extra.sistema_processual = r.sistema;
        extra.processo_fonte = "DataJud CNJ — API Pública";
        extra.processo_confianca = "confirmado";
        extra.processo_enriquecido = true;
        extra.processo_enriquecido_em = r.consultado_em;
      }
    }

    await reidentificarPedido(supabase, pedido, extra);
    return { ok: true, datajudStatus };
  });

/**
 * Reidentificação em lote pela tabela CNJ — sem chamadas externas, idempotente.
 * Processa no máximo 300 pedidos por execução; nunca apaga vara/unidade já confirmadas.
 */
export const reidentificarLote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);
    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select(COLS)
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error("Não foi possível listar os pedidos.");

    let atualizados = 0;
    let reconhecidos = 0;
    let invalidos = 0;
    for (const p of pedidos ?? []) {
      if (!analisarNup(p.numero_processo)) {
        invalidos++;
        continue;
      }
      const r = await reidentificarPedido(supabase, p);
      if (r.mudou) atualizados++;
      if (r.reconhecido) reconhecidos++;
    }
    return { total: pedidos?.length ?? 0, atualizados, reconhecidos, invalidos };
  });
