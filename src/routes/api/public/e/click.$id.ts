import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://certidaodeobjetoepe.org";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/e/click/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (UUID.test(params.id)) {
          try {
            const { registrarClique } = await import("@/lib/emails.server");
            await registrarClique(params.id);
          } catch (e) {
            console.error("Falha ao registrar clique", e);
          }
        }

        // Só aceita destinos internos do próprio site.
        const alvo = new URL(request.url).searchParams.get("u") ?? "/solicitar";
        const caminho = alvo.startsWith("/") && !alvo.startsWith("//") ? alvo : "/solicitar";

        return new Response(null, {
          status: 302,
          headers: { location: `${SITE_URL}${caminho}`, "cache-control": "no-store" },
        });
      },
    },
  },
});
