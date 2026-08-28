import { createFileRoute } from "@tanstack/react-router";

async function executar(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const enviado = header.replace(/^Bearer\s+/i, "").trim();
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
    const { processarRecuperacao } = await import("@/lib/recuperacao.server");
    const resultado = await processarRecuperacao();
    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("Falha na rotina de recuperação", e);
    return new Response(JSON.stringify({ erro: "falha_na_rotina" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/public/cron/recuperacao")({
  server: {
    handlers: {
      POST: ({ request }) => executar(request),
      GET: ({ request }) => executar(request),
    },
  },
});
