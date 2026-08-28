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
      .eq("nome", "semanal")
      .maybeSingle();
    autorizado = Boolean(data?.token) && data!.token === enviado;
  }

  if (!autorizado) return new Response("Unauthorized", { status: 401 });

  try {
    const { processarSemanal } = await import("@/lib/emails.server");
    const resultado = await processarSemanal();
    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("Falha na rotina semanal de e-mails", e);
    return new Response(JSON.stringify({ erro: "falha_na_rotina" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/public/cron/semanal")({
  server: {
    handlers: {
      POST: ({ request }) => executar(request),
      GET: ({ request }) => executar(request),
    },
  },
});
