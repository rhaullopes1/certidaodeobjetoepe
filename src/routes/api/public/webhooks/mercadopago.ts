import { createFileRoute } from "@tanstack/react-router";

// Mercado Pago avisa aqui quando um pagamento muda de status.
// Nunca confiamos no corpo recebido: consultamos o pagamento na API antes de gravar.
export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: {
          type?: string;
          action?: string;
          data?: { id?: string | number };
          resource?: string;
        };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return new Response("payload inválido", { status: 400 });
        }

        const url = new URL(request.url);
        const paymentId =
          payload?.data?.id?.toString() ??
          url.searchParams.get("data.id") ??
          url.searchParams.get("id") ??
          payload?.resource?.split("/").pop();

        const tipo = payload?.type ?? url.searchParams.get("topic") ?? "payment";
        if (tipo !== "payment" || !paymentId) return new Response("ok");

        const { consultarCobranca } = await import("@/lib/mercadopago.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let situacao: Awaited<ReturnType<typeof consultarCobranca>>;
        try {
          situacao = await consultarCobranca(paymentId);
        } catch (e) {
          console.error("Falha ao confirmar pagamento no Mercado Pago", e);
          return new Response("erro ao consultar", { status: 502 });
        }

        if (!situacao.pago && !situacao.cancelado) return new Response("ok");

        const patch = situacao.pago
          ? { status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() }
          : { status: "cancelado" };

        const query = supabaseAdmin.from("pedidos").update(patch).select("*");
        const { data: linhas, error } = situacao.referenceId
          ? await query.eq("protocolo", situacao.referenceId)
          : await query.eq("pagbank_order_id", paymentId);

        if (error) {
          console.error("Falha ao atualizar pedido pelo webhook", error);
          return new Response("erro ao gravar", { status: 500 });
        }

        const pedido = linhas?.[0];
        if (situacao.pago && pedido) {
          try {
            const { notificarPagamentoConfirmado } = await import("@/lib/whatsapp.server");
            await notificarPagamentoConfirmado({
              protocolo: pedido.protocolo,
              whatsapp: pedido.whatsapp,
              valorCentavos: pedido.valor_centavos,
            });
          } catch (e) {
            console.error("Falha ao notificar pagamento por WhatsApp", e);
          }
        }

        return new Response("ok");
      },
    },
  },
});
