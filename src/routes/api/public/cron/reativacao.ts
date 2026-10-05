import { createFileRoute } from "@tanstack/react-router";

// Disparo da campanha de reativação (dias 5 e 10). Autenticado pelo mesmo
// token de rotina usado pela recuperação (server-only).
async function executar(request: Request) {
  const enviado = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!enviado) return new Response("Unauthorized", { status: 401 });

  const envSecret = process.env["CRON_SECRET"];
  let autorizado = Boolean(envSecret) && enviado === envSecret;
  if (!autorizado) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("cron_tokens")
      .select("token")
      .eq("nome", "recuperacao")
      .maybeSingle();
    autorizado = Boolean(data?.token) && data!.token === enviado;
  }
  if (!autorizado) return new Response("Unauthorized", { status: 401 });

  try {
    const { enviarEmailsReativacao } = await import("@/lib/reativacao.server");
    const resultado = await enviarEmailsReativacao();
    return new Response(JSON.stringify(resultado), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("Falha na campanha de reativação", e);
    return new Response(JSON.stringify({ erro: "falha_na_rotina" }), { status: 500 });
  }
}

export const Route = createFileRoute("/api/public/cron/reativacao")({
  server: {
    handlers: {
      POST: ({ request }) => executar(request),
    },
  },
});
