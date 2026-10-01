import { createFileRoute } from "@tanstack/react-router";

/**
 * Retentativa das emissões de Certidão de Antecedentes Criminais que não
 * concluíram no momento da confirmação do pagamento (site da PF fora do ar,
 * timeout etc.). Idempotente: pedidos já emitidos são ignorados.
 */
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
      .eq("nome", "antecedentes")
      .maybeSingle();
    autorizado = Boolean(data?.token) && data!.token === enviado;
  }

  if (!autorizado) return new Response("Unauthorized", { status: 401 });

  try {
    const { reprocessarEmissoesPendentes } = await import("@/lib/antecedentes.server");
    const resultado = await reprocessarEmissoesPendentes();
    return new Response(JSON.stringify({ processados: resultado.length, resultado }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("Falha na rotina de emissão de antecedentes", e);
    return new Response(JSON.stringify({ erro: "falha_na_rotina" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/public/cron/antecedentes")({
  server: {
    handlers: {
      POST: ({ request }) => executar(request),
      GET: ({ request }) => executar(request),
    },
  },
});
