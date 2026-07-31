import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { pedidoSchema } from "./pedidos.schema";
import { criarPedidoNoBanco, buscarPedidoPorProtocolo } from "./pedidos.server";

export const criarPedido = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => pedidoSchema.parse(data))
  .handler(async ({ data }) => criarPedidoNoBanco(data));

export const consultarPedido = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ protocolo: z.string().trim().min(6).max(40) }).parse(data),
  )
  .handler(async ({ data }) => buscarPedidoPorProtocolo(data.protocolo));