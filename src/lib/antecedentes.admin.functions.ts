import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Dispara (ou repete) a emissão automática da Certidão de Antecedentes
 * Criminais de um pedido já pago. Uso interno do painel.
 */
export const dispararEmissaoAntecedentes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pedidoId: string }) => {
    const id = String(input?.pedidoId ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Pedido inválido.");
    return { pedidoId: id };
  })
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .limit(1);
    if (!staff?.length) throw new Error("Acesso restrito à equipe.");

    const { processarEmissaoAntecedentes } = await import("./antecedentes.server");
    return processarEmissaoAntecedentes(data.pedidoId);
  });
