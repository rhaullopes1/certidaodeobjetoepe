import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { pedidoSchema } from "./pedidos.schema";
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