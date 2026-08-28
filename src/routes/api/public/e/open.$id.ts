import { createFileRoute } from "@tanstack/react-router";

const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/e/open/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (UUID.test(params.id)) {
          try {
            const { registrarAbertura } = await import("@/lib/emails.server");
            await registrarAbertura(params.id);
          } catch (e) {
            console.error("Falha ao registrar abertura", e);
          }
        }
        return new Response(PIXEL, {
          status: 200,
          headers: {
            "content-type": "image/gif",
            "cache-control": "no-store, no-cache, must-revalidate",
          },
        });
      },
    },
  },
});
