import { describe, expect, it, vi } from "vitest";
import { precoCentavos } from "./site";

const { sendTemplateEmail, single } = vi.hoisted(() => ({
  sendTemplateEmail: vi.fn().mockResolvedValue(undefined),
  single: vi.fn().mockResolvedValue({ data: null, error: { message: "error code: 1016" } }),
}));

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        gte: () => query,
        order: () => query,
        limit: () => query,
        maybeSingle: async () => ({ data: null }),
        insert: () => query,
        single,
      };
      return query;
    },
  },
}));
vi.mock("./cnj.functions", () => ({ decodificarPartes: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/email-templates/send-email", () => ({ sendTemplateEmail }));

import { criarPedidoNoBanco } from "./pedidos.server";

describe("destino do e-mail de contingência", () => {
  it("abre a lista de atendimento, não o detalhe de um pedido não gravado", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const certidao = {
        numeroProcesso: "0001234-56.2024.8.26.0100",
        nomeParte: "Cliente Ficticio",
        cpf: "52998224725",
      };
      const resultado = await criarPedidoNoBanco({
        ...certidao,
        certidoes: [certidao],
        quantidade: 1,
        valorTotalCentavos: precoCentavos(1),
        email: "simulacao@example.com",
        whatsapp: "11999999999",
        finalidade: "outro",
      });
      expect(single).toHaveBeenCalledOnce();
      expect(resultado).toMatchObject({ contingencia: true });
      expect(sendTemplateEmail).toHaveBeenCalledWith(
        "novo-pedido-admin",
        "contato@certidaodeobjetoepe.org",
        expect.objectContaining({
          templateData: expect.objectContaining({
            url: "https://certidaodeobjetoepe.org/admin",
          }),
        }),
      );
    } finally {
      log.mockRestore();
    }
  });
});