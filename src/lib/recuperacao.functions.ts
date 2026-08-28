import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function exigirEquipe(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error || !data?.length) throw new Error("Acesso restrito à equipe.");
}

const idSchema = z.object({ id: z.string().uuid() });

export const painelRecuperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { listarRecuperacao, lerConfig } = await import("./recuperacao.server");
    const [painel, config] = await Promise.all([listarRecuperacao(), lerConfig()]);
    return { ...painel, config };
  });

export const reenviarRecuperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { reenviarEtapaManual } = await import("./recuperacao.server");
    return reenviarEtapaManual(data.id);
  });

export const marcarPagoRecuperacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { marcarComoPago } = await import("./recuperacao.server");
    return marcarComoPago(data.id);
  });

export const cancelarRecuperacaoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { cancelarRecuperacao } = await import("./recuperacao.server");
    return cancelarRecuperacao(data.id);
  });

export const salvarEmailSequencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        etapa: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        assunto: z.string().trim().min(3).max(200),
        corpo: z.string().trim().min(10).max(8000),
        ativo: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { salvarConfig } = await import("./recuperacao.server");
    return salvarConfig(data);
  });

export const enviarEmailTeste = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        etapa: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        email: z.string().trim().email().max(255),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { enviarTeste } = await import("./recuperacao.server");
    return enviarTeste(data.etapa, data.email);
  });
