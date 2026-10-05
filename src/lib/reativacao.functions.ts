import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function exigirEquipe(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .in("role", ["admin", "equipe"]);
  if (error || !data?.length) throw new Error("Acesso restrito à equipe.");
}

export const painelReativacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { listarReativacao } = await import("./reativacao.server");
    return listarReativacao();
  });

export const registrarContatoReativacaoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { registrarContatoReativacao } = await import("./reativacao.server");
    return registrarContatoReativacao(data.id);
  });

export const dispararEmailsReativacaoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { enviarEmailsReativacao } = await import("./reativacao.server");
    return enviarEmailsReativacao();
  });
