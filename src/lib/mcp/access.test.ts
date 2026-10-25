import { describe, expect, it } from "vitest";
import { orderAccess } from "./access";

describe("acesso MCP aos pedidos", () => {
  it.each(["admin", "equipe"])("autoriza equipe administrativa: %s", (role) => {
    expect(orderAccess([role])).toBe("staff");
  });
  it("nega acesso geral ao operador", () => {
    expect(orderAccess(["operador_certidao"])).toBe("denied");
  });
  it("limita clientes ao caminho de pedidos próprios", () => {
    expect(orderAccess([])).toBe("customer");
  });
});