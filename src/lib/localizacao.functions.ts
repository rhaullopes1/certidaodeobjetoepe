import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analisarNup } from "./cnj";
import { decodificarPartes } from "./cnj.functions";
import { colunasLocalizacao } from "./localizacao";
import type { Json, TablesInsert } from "@/integrations/supabase/types";

/**
 * Recalcula a localização do processo (tabelas CNJ) e, se pedido e configurado,
 * consulta o DataJud. Somente equipe. Nunca inventa dados: o que não é confirmado fica null.
 */
export const atualizarLocalizacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { pedidoId: string; consultarDatajud?: boolean }) => ({
    pedidoId: String(i?.pedidoId ?? ""),
    consultarDatajud: Boolean(i?.consultarDatajud),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: papeis } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!papeis || papeis.length === 0) throw new Error("Acesso restrito à equipe.");

    const { data: pedido, error } = await supabase
      .from("pedidos")
      .select("id, numero_processo")
      .eq("id", data.pedidoId)
      .maybeSingle();
    if (error || !pedido) throw new Error("Pedido não encontrado.");

    const partes = analisarNup(pedido.numero_processo);
    const dec = partes ? await decodificarPartes(partes) : null;
    const colunas: Partial<TablesInsert<"pedidos">> = colunasLocalizacao(dec);
    let datajudStatus: string | null = null;

    if (data.consultarDatajud && dec?.tribunalSigla) {
      const { consultarDatajud } = await import("./datajud.server");
      const r = await consultarDatajud(pedido.numero_processo, dec.tribunalSigla);
      datajudStatus = r.status;
      colunas.processo_dados = {
        ...((colunas.processo_dados as { [k: string]: Json }) ?? {}),
        datajud: r as unknown as Json,
      };
      if (r.status === "ok" && r.orgaoJulgador) {
        colunas.vara = r.orgaoJulgador;
        colunas.unidade_judiciaria = r.orgaoJulgador;
        if (r.sistema) colunas.sistema_processual = r.sistema;
        colunas.processo_fonte = "DataJud CNJ — API Pública";
        colunas.processo_confianca = "confirmado";
        colunas.processo_enriquecido = true;
        colunas.processo_enriquecido_em = r.consultado_em;
      }
    }

    const { error: erroUp } = await supabase.from("pedidos").update(colunas).eq("id", pedido.id);
    if (erroUp) throw new Error("Não foi possível salvar a localização.");
    return { ok: true, datajudStatus };
  });
