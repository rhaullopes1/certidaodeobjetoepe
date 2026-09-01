import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { analisarNup, type PartesNup } from "./cnj";

export interface ProcessoDecodificado {
  reconhecido: boolean;
  digitoValido: boolean;
  formatado: string;
  ano: number | null;
  segmento: number | null;
  segmentoNome: string | null;
  tribunalSigla: string | null;
  tribunalNome: string | null;
  uf: string | null;
  cidade: string | null;
  comarca: string | null;
  sistema: string | null;
  codigoOrigem: string | null;
  mensagem: string | null;
}

const VAZIO: ProcessoDecodificado = {
  reconhecido: false,
  digitoValido: false,
  formatado: "",
  ano: null,
  segmento: null,
  segmentoNome: null,
  tribunalSigla: null,
  tribunalNome: null,
  uf: null,
  cidade: null,
  comarca: null,
  sistema: null,
  codigoOrigem: null,
  mensagem: null,
};

/** Consulta as tabelas CNJ e monta o resultado. Usada no servidor. */
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

  const base: ProcessoDecodificado = {
    ...VAZIO,
    formatado: partes.formatado,
    ano: partes.ano,
    segmento: partes.segmento,
    codigoOrigem: partes.codigoOrigem,
    digitoValido: partes.digitoValido,
  };

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

  if (!tribunal) {
    return {
      ...base,
      segmentoNome: segmento?.nome ?? null,
      mensagem: "Não localizamos o tribunal para este código. Nossa equipe confere manualmente.",
    };
  }

  const { data: comarca } = await supabase
    .from("cnj_comarcas")
    .select("nome, cidade, uf")
    .eq("tribunal_id", tribunal.id)
    .eq("codigo_origem", partes.codigoOrigem)
    .maybeSingle();

  return {
    ...base,
    reconhecido: true,
    segmentoNome: segmento?.nome ?? null,
    tribunalSigla: tribunal.sigla,
    tribunalNome: tribunal.nome,
    uf: comarca?.uf ?? tribunal.uf ?? null,
    cidade: comarca?.cidade ?? tribunal.sede ?? null,
    comarca: comarca?.nome ?? null,
    sistema: tribunal.sistema,
    mensagem: partes.digitoValido
      ? null
      : "O dígito verificador não confere. Revise o número informado.",
  };
}

/** Decodifica um número de processo a partir do texto digitado. */
export const decodificarProcesso = createServerFn({ method: "POST" })
  .inputValidator((input: { numero: string }) => ({ numero: String(input?.numero ?? "") }))
  .handler(async ({ data }): Promise<ProcessoDecodificado> => {
    const partes = analisarNup(data.numero);
    if (!partes) {
      return { ...VAZIO, mensagem: "Informe os 20 dígitos do número único do processo." };
    }
    return decodificarPartes(partes);
  });
