import { createFileRoute } from "@tanstack/react-router";

// A Stripe avisa aqui quando um pagamento muda de status.
// Nunca confiamos no corpo recebido: consultamos a sessão na API antes de gravar.
export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: {
          type?: string;
          data?: { object?: { id?: string; object?: string; metadata?: Record<string, string> } };
        };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return new Response("payload inválido", { status: 400 });
        }

        const objeto = payload?.data?.object;
        const tipo = payload?.type ?? "";
        const sessionId = objeto?.object === "checkout.session" ? objeto?.id : undefined;

        if (!sessionId || !tipo.startsWith("checkout.session")) return new Response("ok");

        const { consultarCheckout } = await import("@/lib/stripe.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        /** Registra o evento para diagnóstico; nunca quebra o processamento. */
        const registrarEvento = async (resultado: string) => {
          try {
            await supabaseAdmin.from("webhook_eventos").insert({
              provedor: "stripe",
              tipo,
              payment_id: sessionId,
              resultado,
              payload: payload as unknown as import("@/integrations/supabase/types").Json,
            });
          } catch (e) {
            console.error("Falha ao registrar evento de webhook", e);
          }
        };

        let situacao: Awaited<ReturnType<typeof consultarCheckout>>;
        try {
          situacao = await consultarCheckout(sessionId);
        } catch (e) {
          console.error("Falha ao confirmar pagamento na Stripe", e);
          await registrarEvento("erro_consulta_api");
          return new Response("erro ao consultar", { status: 502 });
        }

        if (!situacao.pago) {
          if (!situacao.expirado) {
            await registrarEvento("ignorado_status_intermediario");
            return new Response("ok");
          }
          // Link vencido não cancela o pedido: apenas limpamos a sessão para
          // que um novo link de pagamento seja gerado quando o cliente voltar.
          const limpar = supabaseAdmin
            .from("pedidos")
            .update({ stripe_session_id: null, checkout_url: null, pix_expira_em: null });
          await (situacao.referenceId
            ? limpar.eq("protocolo", situacao.referenceId)
            : limpar.eq("stripe_session_id", sessionId));
          await registrarEvento("link_vencido_liberado_para_novo");
          return new Response("ok");
        }

        const patch = { status: "pago", pago_em: situacao.pagoEm ?? new Date().toISOString() };

        const query = supabaseAdmin.from("pedidos").update(patch);
        const { error } = situacao.referenceId
          ? await query.eq("protocolo", situacao.referenceId)
          : await query.eq("stripe_session_id", sessionId);

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
