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

/** Dispara o e-mail de boas-vindas do próprio usuário logado (uma única vez). */
export const dispararBoasVindas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { enviarBoasVindas } = await import("./emails.server");
    try {
      return await enviarBoasVindas(context.userId);
    } catch (e) {
      console.error("Falha ao enviar boas-vindas", e);
      return { enviado: false, motivo: "erro" as const };
    }
  });

export const painelEmailsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { painelEmails } = await import("./emails.server");
    return painelEmails();
  });

export const salvarBoasVindas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        assunto: z.string().trim().min(3).max(200),
        corpo: z.string().trim().min(10).max(20000),
        ativo: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { salvarConfigEmail } = await import("./emails.server");
    return salvarConfigEmail({ chave: "boas-vindas", ...data });
  });

export const testarBoasVindas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({ email: z.string().trim().email().max(255), nome: z.string().trim().max(120) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { enviarBoasVindasTeste } = await import("./emails.server");
    return enviarBoasVindasTeste(data.email, data.nome);
  });

export const salvarCampanhaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        titulo: z.string().trim().min(3).max(160),
        assunto: z.string().trim().min(3).max(200),
        conteudo: z.string().trim().min(10).max(40000),
        agendamento: z.string().trim().min(1).nullable(),
        status: z.union([z.literal("rascunho"), z.literal("agendado")]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { salvarCampanha } = await import("./emails.server");
    return salvarCampanha(data);
  });

export const excluirCampanhaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { excluirCampanha } = await import("./emails.server");
    return excluirCampanha(data.id);
  });

export const enviarCampanhaAgora = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await exigirEquipe(context);
    const { processarCampanha } = await import("./emails.server");
    return processarCampanha(data.id);
  });

export const contatosCampanha = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirEquipe(context);
    const { listarContatos } = await import("./emails.server");
    const contatos = await listarContatos();
    return { total: contatos.length, comConta: contatos.filter((c) => c.temConta).length };
  });
