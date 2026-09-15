import { createFileRoute } from "@tanstack/react-router";

async function executar(request: Request) {
  const enviado = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const envSecret = process.env["CRON_SECRET"];
  if (!enviado || !envSecret || enviado !== envSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const campanha = url.searchParams.get("campanha");
    const { executarProximoCiclo, processarFila, gerarCampanha } = await import(
      "@/lib/conteudo.server"
    );

    if (campanha) {
      const limite = Number(url.searchParams.get("limite") ?? 3);
      const resultado = await gerarCampanha(campanha, Math.min(Math.max(limite, 1), 5));
      return new Response(JSON.stringify(resultado), {
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    }

    const ciclo = await executarProximoCiclo();
    const fila = await processarFila(10);
    return new Response(JSON.stringify({ ciclo, fila }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("Falha no ciclo de conteúdo", e);
    return new Response(JSON.stringify({ erro: "falha_no_ciclo" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/public/cron/conteudo")({
  server: {
    handlers: {
      POST: ({ request }) => executar(request),
      GET: ({ request }) => executar(request),
    },
  },
});
