import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { analisarNup, type PartesNup } from "./cnj";
import {
  DECODIFICACAO_VAZIA,
  montarDecodificacao,
  type ProcessoDecodificado,
} from "./localizacao";

export type { ProcessoDecodificado } from "./localizacao";

/** Consulta as tabelas CNJ e monta o resultado (determinístico, sem IA). Usada no servidor. */
export async function decodificarPartes(partes: PartesNup): Promise<ProcessoDecodificado> {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const { data: segmento } = await supabase
    .from("cnj_segmentos")
    .select("nome")
    .eq("codigo", partes.segmento)
    .maybeSingle();

  const { data: tribunal } = await supabase
    .from("cnj_tribunais")
    .select("id, sigla, nome, uf, sede, sistema")
    .eq("segmento", partes.segmento)
    .eq("codigo_tr", partes.codigoTribunal)
    .maybeSingle();

  const { data: comarca } = tribunal
    ? await supabase
        .from("cnj_comarcas")
        .select("nome, cidade, uf, foro")
        .eq("tribunal_id", tribunal.id)
        .eq("codigo_origem", partes.codigoOrigem)
        .maybeSingle()
    : { data: null };

  return montarDecodificacao(partes, segmento?.nome ?? null, tribunal ?? null, comarca ?? null);
}

/** Decodifica um número de processo a partir do texto digitado. */
export const decodificarProcesso = createServerFn({ method: "POST" })
  .inputValidator((input: { numero: string }) => ({ numero: String(input?.numero ?? "") }))
  .handler(async ({ data }): Promise<ProcessoDecodificado> => {
    const partes = analisarNup(data.numero);
    if (!partes) {
      return { ...DECODIFICACAO_VAZIA, mensagem: "Informe os 20 dígitos do número único do processo." };
    }
    return decodificarPartes(partes);
  });
