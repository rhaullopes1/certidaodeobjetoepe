import { createServerFn } from "@tanstack/react-start";
import { antecedentesSchema, type AntecedentesPedidoInput } from "./antecedentes.schema";

export type AntecedentesPedidoResumo = {
  protocolo: string;
  nome: string;
  email: string;
  valorCentavos: number;
  status: string;
  criadoEm: string;
  pixCopiaECola: string | null;
  pixQrCodeUrl: string | null;
  checkoutUrl: string | null;
  confirmacaoAutomatica: boolean;
};

export const criarPedidoAntecedentes = createServerFn({ method: "POST" })
  .inputValidator((data: AntecedentesPedidoInput) => antecedentesSchema.parse(data))
  .handler(async ({ data }): Promise<AntecedentesPedidoResumo> => {
    const { criarPedidoAntecedentesNoBanco } = await import("./antecedentes.pedido.server");
    return criarPedidoAntecedentesNoBanco(data);
  });
