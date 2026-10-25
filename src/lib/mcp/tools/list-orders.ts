import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { orderAccess } from "../access";

export default defineTool({
  name: "listar_pedidos",
  title: "Consultar pedidos de certidão",
  description: "Consulta até 50 pedidos: clientes veem somente seus pedidos; admin e equipe consultam o atendimento. Não disponível para operadores.",
  inputSchema: {
    protocolo: z.string().trim().min(1).max(80).optional().describe("Protocolo exato do pedido, se conhecido."),
    status: z.enum(["aguardando_pagamento", "pago", "em_analise", "protocolado", "emitida", "cancelado", "expirado"]).optional().describe("Situação do pedido para filtrar."),
    limite: z.number().int().min(1).max(50).default(20).describe("Máximo de pedidos retornados, de 1 a 50."),
    offset: z.number().int().min(0).max(10000).default(0).describe("Número de pedidos a pular para consultar a próxima página."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ protocolo, status, limite, offset }, ctx) => {
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError("Entre na sua conta para consultar pedidos.");
    const client = supabaseForUser(ctx);
    const roles = await client.from("user_roles").select("role").eq("user_id", userId);
    if (roles.error) throw new ToolError("Não foi possível verificar suas permissões.");
    const access = orderAccess((roles.data ?? []).map(({ role }) => role));
    if (access === "denied") throw new ToolError("Operadores devem consultar a fila atribuída no portal operacional.");
    let query = client.from("pedidos").select("protocolo,status,created_at,uf,quantidade")
      .order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + limite - 1);
    if (access === "customer") query = query.eq("user_id", userId);
    if (protocolo) query = query.eq("protocolo", protocolo.toUpperCase());
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw new ToolError("Não foi possível consultar os pedidos. Tente novamente.");
    const pedidos = (data ?? []).map((p) => ({ protocolo: p.protocolo, status: p.status, criado_em: p.created_at, uf: p.uf, quantidade: p.quantidade }));
    return {
      content: [{ type: "text", text: pedidos.length ? pedidos.map((p) => `${p.protocolo}: ${p.status} | ${p.criado_em} | ${p.uf ?? "—"}`).join("\n") : "Nenhum pedido encontrado." }],
      structuredContent: { pedidos, offset, limite },
    };
  },
});