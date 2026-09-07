import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Registro do contato enviado pelo formulário da home.
 * Persistimos antes de abrir o WhatsApp para que nenhum lead se perca
 * caso o cliente feche a janela do WhatsApp ou o popup seja bloqueado.
 */
const leadSchema = z.object({
  nome: z.string().trim().min(3).max(100),
  whatsapp: z.string().trim().min(8).max(20),
  email: z.string().trim().max(255).optional().default(""),
  numeroProcesso: z.string().trim().max(60).optional().default(""),
  uf: z.string().trim().max(2).optional().default(""),
  observacoes: z.string().trim().max(1000).optional().default(""),
  origem: z.string().trim().max(40).optional().default("home"),
});

export const registrarLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const url = process.env["SUPABASE_URL"]!;

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { error } = await supabase.from("leads").insert({
      nome: data.nome,
      whatsapp: data.whatsapp,
      email: data.email || null,
      numero_processo: data.numeroProcesso || null,
      uf: data.uf || null,
      observacoes: data.observacoes || null,
      origem: data.origem || "home",
    });

    if (error) {
      console.error("Falha ao registrar lead", error.message);
      return { ok: false as const };
    }

    return { ok: true as const };
  });
