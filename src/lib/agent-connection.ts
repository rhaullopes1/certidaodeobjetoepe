export const AGENT_APP_NAME = "Certidão de objeto e pé";

export function agentServerSlug(name: string): string {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 63).replace(/-+$/g, "") || "lovable-app";
  return ["workspace", "computer-use", "claude-in-chrome", "claude-preview", "claude-browser"].includes(slug)
    ? `${slug}-app` : slug;
}

export function agentConnectionDetails(origin: string) {
  const mcpUrl = new URL("/mcp", origin).toString();
  const slug = agentServerSlug(AGENT_APP_NAME);
  const quotedUrl = `'${mcpUrl.replace(/'/g, "'\\''")}'`;
  return {
    mcpUrl,
    slug,
    command: `claude mcp add --scope user --transport http ${slug} ${quotedUrl}`,
    claudeUrl: `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(AGENT_APP_NAME)}&connectorUrl=${encodeURIComponent(mcpUrl)}`,
  };
}