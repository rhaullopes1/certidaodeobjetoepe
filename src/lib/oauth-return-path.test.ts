import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "./oauth-return-path";

describe("retorno seguro após consentimento", () => {
  it("preserva autorização e fragmento locais", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#confirmar")).toBe("/.lovable/oauth/consent?authorization_id=abc#confirmar");
  });
  it.each(["//outside.invalid", "/\\outside.invalid/", "/\noutside.invalid", "https://outside.invalid", "/%2f%2foutside.invalid"])("não navega para origem externa: %s", (input) => {
    const value = oauthReturnPath(input);
    expect(new URL(value, "https://app.invalid").origin).toBe("https://app.invalid");
  });
});