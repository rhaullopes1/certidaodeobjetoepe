import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import { analisarNup } from "./cnj";
import { decodificarPartes } from "./cnj.functions";
import { colunasLocalizacao, mesclarLocalizacao, type ColunasPedidoLocalizacao } from "./localizacao";
import type { Database, Json } from "@/integrations/supabase/types";

const COLS =
  "id, protocolo, numero_processo, tribunal_sigla, tribunal_nome, segmento_judiciario, uf_processo, cidade_processo, comarca_processo, foro, codigo_origem_cnj, vara, unidade_judiciaria, sistema_processual, processo_fonte, processo_confianca, processo_dados";

async function exigirEquipe(supabase: SupabaseClient<Database>, userId: string) {
  const { data: papeis } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["admin", "equipe"]);
  if (!papeis || papeis.length === 0) throw new Error("Acesso restrito à equipe.");
}

/** Reidentifica um pedido só pela tabela CNJ (sem chamada externa). Retorna se algo mudou. */
async function reidentificarPedido(
  supabase: SupabaseClient<Database>,
  pedido: ColunasPedidoLocalizacao & { id: string; numero_processo: string },
  extra: ColunasPedidoLocalizacao = {},
) {
  const partes = analisarNup(pedido.numero_processo);
  if (!partes) return { mudou: false, reconhecido: false, final: null };
  const dec = await decodificarPartes(partes);
  const novo = mesclarLocalizacao(pedido, colunasLocalizacao(dec));
  const final: ColunasPedidoLocalizacao = {
    ...novo,
    ...extra,
    processo_dados: {
      ...((novo.processo_dados as Record<string, Json>) ?? {}),
      ...((extra.processo_dados as Record<string, Json>) ?? {}),
    },
  };
  const chaves = Object.keys(final).filter((k) => k !== "processo_dados") as (keyof typeof final)[];
  const mudou =
    Object.keys(extra).length > 0 ||
    chaves.some((k) => (final[k] ?? null) !== ((pedido as Record<string, unknown>)[k] ?? null)) ||
    !(pedido.processo_dados as Record<string, unknown> | null)?.["cnj"];
  if (mudou) {
    const { error } = await supabase.from("pedidos").update(final).eq("id", pedido.id);
    if (error) throw new Error("Não foi possível salvar a localização.");
  }
  return { mudou, reconhecido: dec.reconhecido, final };
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
        datajud: { ...r, consultadoEm: new Date().toISOString() } as unknown as Json,
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

export type ModoLote = "sem_localizacao" | "pendentes" | "todos";

/**
 * Reidentificação em lote pela tabela CNJ — sem chamadas externas e sem DataJud, idempotente.
 * "sem_localizacao": só pedidos ainda sem tribunal identificado. "todos": recalcula tudo,
 * mas nunca apaga vara/unidade nem rebaixa identificação confirmada por outra fonte.
 */
export const reidentificarLote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { modo?: ModoLote }) => ({
    modo: (i?.modo === "todos" || i?.modo === "pendentes" ? i.modo : "sem_localizacao") as ModoLote,
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await exigirEquipe(supabase, userId);

    const r = {
      processados: 0, atualizados: 0, invalidos: 0,
      ganharamTribunal: 0, ganharamComarca: 0, ganharamForo: 0, ganharamSistema: 0,
      confirmados: 0, parciais: 0, naoIdentificados: 0,
      listaParciais: [] as string[],
    };
    const PAGINA = 250;
    for (let pagina = 0; pagina < 8; pagina++) {
      let q = supabase.from("pedidos").select(COLS).order("created_at", { ascending: true });
      if (data.modo === "sem_localizacao") q = q.is("tribunal_sigla", null);
      if (data.modo === "pendentes") q = q.or("processo_confianca.is.null,processo_confianca.neq.confirmado");
      // No modo "sem_localizacao" a lista encolhe conforme os pedidos são preenchidos;
      // pedidos que continuam sem tribunal são pulados pelo offset acumulado de inválidos/não reconhecidos.
      const inicio =
        data.modo === "todos"
          ? pagina * PAGINA
          : data.modo === "pendentes"
            ? r.invalidos + r.naoIdentificados + r.parciais
            : r.invalidos + r.naoIdentificados;
      const { data: lista, error } = await q.range(inicio, inicio + PAGINA - 1);
      if (error) throw new Error("Não foi possível listar os pedidos.");
      if (!lista || lista.length === 0) break;

      for (const p of lista) {
        r.processados++;
        if (!analisarNup(p.numero_processo)) {
          r.invalidos++;
          continue;
        }
        const antes = { ...p };
        const res = await reidentificarPedido(supabase, p);
        if (res.mudou) r.atualizados++;
        const depois = res.final ?? antes;
        if (!antes.tribunal_sigla && depois.tribunal_sigla) r.ganharamTribunal++;
        if (!antes.comarca_processo && depois.comarca_processo) r.ganharamComarca++;
        if (!antes.foro && depois.foro) r.ganharamForo++;
        if (!antes.sistema_processual && depois.sistema_processual) r.ganharamSistema++;
        if (depois.processo_confianca === "confirmado") r.confirmados++;
        else if (depois.processo_confianca === "parcial") {
          r.parciais++;
          if (r.listaParciais.length < 50) r.listaParciais.push(`${p.protocolo} (${depois.tribunal_sigla ?? "?"} ${depois.codigo_origem_cnj ?? ""})`.trim());
        }
        else r.naoIdentificados++;
      }
      if (lista.length < PAGINA) break;
    }
    console.info("[reidentificarLote]", data.modo, JSON.stringify({ ...r, listaParciais: r.listaParciais.length }));
    return r;
  });
