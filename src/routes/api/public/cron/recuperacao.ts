import { createFileRoute } from "@tanstack/react-router";

async function executar(request: Request) {
  const segredo = process.env["CRON_SECRET"];
  if (!segredo) {
    return new Response(JSON.stringify({ erro: "CRON_SECRET não configurado" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const header = request.headers.get("authorization") ?? "";
  const enviado = header.replace(/^Bearer\s+/i, "").trim();
  if (enviado !== segredo) {
    return new Response("Unauthorized", { status: 401 });
  }

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
