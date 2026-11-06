import { describe, expect, it } from "vitest";
import { agentConnectionDetails, agentServerSlug } from "./agent-connection";

describe("agent connection details", () => {
  it("uses the current deployment origin and the existing /mcp endpoint", () => {
    expect(agentConnectionDetails("https://custom.example/anything").mcpUrl).toBe("https://custom.example/mcp");
    expect(agentConnectionDetails("http://localhost:8080").mcpUrl).toBe("http://localhost:8080/mcp");
  });
  it("normalizes accented names into ASCII", () => {
    expect(agentServerSlug("Certidão de objeto e pé")).toBe("certidao-de-objeto-e-pe");
  });
  it("caps names at 63 characters", () => {
    expect(agentServerSlug("a".repeat(80))).toBe("a".repeat(63));
  });
  it("uses the fallback for empty slugs", () => {
    expect(agentServerSlug("!!!")).toBe("lovable-app");
  });
  it.each(["workspace", "computer-use", "claude-in-chrome", "claude-preview", "claude-browser"])("avoids reserved name %s", (name) => {
    expect(agentServerSlug(name)).toBe(`${name}-app`);
  });
  it("quotes URLs safely for a user-scoped HTTP command", () => {
    expect(agentConnectionDetails("https://exam'ple.test").command).toBe("claude mcp add --scope user --transport http certidao-de-objeto-e-pe 'https://exam'\\''ple.test/mcp'");
  });
  it("prefills Claude with the name and runtime URL", () => {
    const url = new URL(agentConnectionDetails("https://custom.example").claudeUrl);
    expect(url.searchParams.get("connectorName")).toBe("Certidão de objeto e pé");
    expect(url.searchParams.get("connectorUrl")).toBe("https://custom.example/mcp");
  });
});