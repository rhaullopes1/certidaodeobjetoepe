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

        /** Registra o evento para diagnóstico; nunca quebra o processamento. */
        const registrarEvento = async (resultado: string) => {
          try {
            await supabaseAdmin.from("webhook_eventos").insert({
              provedor: "mercadopago",
              tipo,
              payment_id: paymentId,
              resultado,
              payload: payload as unknown as import("@/integrations/supabase/types").Json,
            });
          } catch (e) {
            console.error("Falha ao registrar evento de webhook", e);
          }
        };

        let situacao: Awaited<ReturnType<typeof consultarCobranca>>;
        try {
          situacao = await consultarCobranca(paymentId);
        } catch (e) {
          console.error("Falha ao confirmar pagamento no Mercado Pago", e);
          await registrarEvento("erro_consulta_api");
          return new Response("erro ao consultar", { status: 502 });
        }

        if (!situacao.pago && !situacao.cancelado) {
          await registrarEvento("ignorado_status_intermediario");
          return new Response("ok");
        }

        const patch = situacao.pago
          ? { status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() }
          : { status: "cancelado" };

        const query = supabaseAdmin.from("pedidos").update(patch);
        const { error } = situacao.referenceId
          ? await query.eq("protocolo", situacao.referenceId)
          : await query.eq("pagbank_order_id", paymentId);

        if (error) {
          console.error("Falha ao atualizar pedido pelo webhook", error);
          await registrarEvento("erro_ao_gravar");
          return new Response("erro ao gravar", { status: 500 });
        }

        await registrarEvento(situacao.pago ? "pedido_marcado_pago" : "pedido_marcado_cancelado");
        return new Response("ok");
      },
    },
  },
});
