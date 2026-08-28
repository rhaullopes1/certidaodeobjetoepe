import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { pedidoSchema } from "./pedidos.schema";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gerarPixCopiaECola } from "./pix";
import { PIX, DIAS_PARA_EXPIRAR } from "./site";
import {
  criarPedidoNoBanco,
  buscarPedidoPorProtocolo,
  reenviarEmailPedidoNoBanco,
} from "./pedidos.server";

export const criarPedido = createServerFn({ method: "POST" })
  .validator((data: unknown) => pedidoSchema.parse(data))
  .handler(async ({ data }) => criarPedidoNoBanco(data));

export const consultarPedido = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ protocolo: z.string().trim().min(6).max(40) }).parse(data),
  )
  .handler(async ({ data }) => buscarPedidoPorProtocolo(data.protocolo));

export const reenviarEmailPedido = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        protocolo: z.string().trim().min(6).max(40),
        email: z.string().trim().email().max(255),
      })
      .parse(data),
  )
  .handler(async ({ data }) => reenviarEmailPedidoNoBanco(data.protocolo, data.email));

export type PedidoDoCliente = {
  protocolo: string;
  numeroProcesso: string;
  nomeParte: string | null;
  quantidade: number;
  valorCentavos: number;
  status: string;
  criadoEm: string;
  pagoEm: string | null;
  pixCopiaECola: string;
  pixQrCodeUrl: string | null;
  pixExpiraEm: string | null;
};

/** Histórico do cliente logado. A RLS garante que só retornam pedidos da própria conta. */
export const meusPedidos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PedidoDoCliente[]> => {
    const { data, error } = await context.supabase
      .from("pedidos")
      .select(
        "protocolo, numero_processo, nome_parte, quantidade, valor_centavos, status, created_at, pago_em, pix_codigo, pix_qrcode_url, pix_expira_em",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error("Não foi possível carregar seus pedidos.");

    const limite = DIAS_PARA_EXPIRAR * 24 * 60 * 60 * 1000;

    return (data ?? []).map((row) => {
      const vencido =
        row.status === "aguardando_pagamento" &&
        Date.now() - new Date(row.created_at).getTime() >= limite;

      return {
        protocolo: row.protocolo,
        numeroProcesso: row.numero_processo,
        nomeParte: row.nome_parte,
        quantidade: row.quantidade ?? 1,
        valorCentavos: row.valor_centavos,
        status: vencido ? "expirado" : row.status,
        criadoEm: row.created_at,
        pagoEm: row.pago_em,
        pixQrCodeUrl: row.pix_qrcode_url,
        pixExpiraEm: row.pix_expira_em,
        pixCopiaECola:
          row.pix_codigo ??
          gerarPixCopiaECola({
            chave: PIX.chave,
            nome: PIX.nome,
            cidade: PIX.cidade,
            valorCentavos: row.valor_centavos,
            txid: row.protocolo,
          }),
      };
    });
  });
