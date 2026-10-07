import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Dados do Centro de Comando Comercial — só equipe/admin. */
export const painelComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: papeis } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["admin", "equipe"]);
    if (!papeis?.length) throw new Error("Acesso restrito à equipe.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const desde = new Date(Date.now() - 31 * 86400000).toISOString();

    const [pedidos, recuperacao] = await Promise.all([
      supabaseAdmin
        .from("pedidos")
        .select(
          "id, protocolo, nome_parte, whatsapp, finalidade, quantidade, status, valor_centavos, created_at, pago_em, mercadopago_status, reativado_em, oferta_expira_em",
        )
        .gt("valor_centavos", 0)
        .not("protocolo", "ilike", "TESTE%")
        .or(`created_at.gte.${desde},pago_em.gte.${desde}`)
        .order("created_at", { ascending: false })
        .limit(3000),
      supabaseAdmin
        .from("abandoned_orders")
        .select("pedido_id, status_automacao, etapa_1_em, etapa_2_em, etapa_3_em, valor_total_centavos, valor_recuperado_centavos")
        .limit(3000),
    ]);
    if (pedidos.error) throw new Error("Não foi possível carregar os pedidos.");
    if (recuperacao.error) throw new Error("Não foi possível carregar a recuperação.");
    return { pedidos: pedidos.data ?? [], recuperacao: recuperacao.data ?? [] };
  });
