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

export const painelConteudoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { painelConteudo } = await import("./conteudo.server");
    return painelConteudo();
  });

export const listarTemasFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { listarTemas } = await import("./conteudo.server");
    return listarTemas();
  });

export const alternarTemaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid(), ativo: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { alternarTema } = await import("./conteudo.server");
    return alternarTema(data.id, data.ativo);
  });

export const gerarConteudoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        topicId: z.string().uuid().optional(),
        nicho: z.enum(["caminhoneiros", "motoristas_app"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { gerarConteudo } = await import("./conteudo.server");
    const item = await gerarConteudo({ ...data, criadoPor: context.userId });
    return { id: item.id, titulo: item.titulo, slug: item.slug };
  });

export const aprovarItemFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { aprovarItem } = await import("./conteudo.server");
    return aprovarItem(data.id);
  });

export const excluirItemFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { excluirItem } = await import("./conteudo.server");
    return excluirItem(data.id);
  });

export const agendarItemFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        quando: z.string().min(4),
        canais: z.array(z.string()).min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { agendarItem } = await import("./conteudo.server");
    return agendarItem(data.id, new Date(data.quando).toISOString(), data.canais);
  });

export const reprocessarJobFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { reprocessarJob } = await import("./conteudo.server");
    return reprocessarJob(data.jobId);
  });

export const processarFilaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { processarFila } = await import("./conteudo.server");
    return processarFila(10);
  });

export const executarCicloFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ forcar: z.boolean().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { executarProximoCiclo } = await import("./conteudo.server");
    return executarProximoCiclo({ forcar: data.forcar ?? false, criadoPor: context.userId });
  });

export const salvarAgendaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        horarioCaminhoneiros: z.string().regex(/^\d{2}:\d{2}$/),
        horarioMotoristas: z.string().regex(/^\d{2}:\d{2}$/),
        timezone: z.string().min(3),
        ativo: z.boolean(),
        modoTeste: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { salvarAgenda } = await import("./conteudo.server");
    return salvarAgenda(data);
  });
