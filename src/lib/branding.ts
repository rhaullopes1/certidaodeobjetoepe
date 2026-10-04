/**
 * Camada central de branding por host.
 * - Host comercial (padrão): comportamento atual, marca "Certidão de Objeto e Pé".
 * - Host do portal operacional (VITE_OPERATOR_PORTAL_HOST, aceita lista separada por vírgula):
 *   experiência white-label neutra, sem marca comercial, analytics, links ou preços.
 * Sem host configurado, tudo permanece comercial.
 */
export type ModoBranding = "comercial" | "operacional";

/**
 * Host do portal usado quando VITE_OPERATOR_PORTAL_HOST não está definido (ou está vazio).
 * Evita que o modo neutro se perca se o arquivo de ambiente for regenerado pela plataforma.
 * Quando a variável estiver definida, ela é a única fonte (permite trocar ou ampliar a lista).
 */
export const HOST_OPERACIONAL_PADRAO = "operacao.flydox.net";

export type Branding = {
  modo: ModoBranding;
  /** Nome exibido no cabeçalho do painel do operador. */
  nomePainelOperador: string;
  /** Sufixo de título das páginas internas (vazio no modo operacional). */
  sufixoTitulo: string;
  /** Scripts de anúncios/analytics comerciais (Google Ads) e PWA comercial. */
  scriptsComerciais: boolean;
  /** Links para o site público (voltar ao site, criar conta de cliente). */
  linksComerciais: boolean;
};

export const BRANDING_COMERCIAL: Branding = {
  modo: "comercial",
  nomePainelOperador: "Painel Operacional",
  sufixoTitulo: " | Certidão de Objeto e Pé",
  scriptsComerciais: true,
  linksComerciais: true,
};

export const BRANDING_OPERACIONAL: Branding = {
  modo: "operacional",
  nomePainelOperador: "PORTAL OPERACIONAL | efficiency",
  sufixoTitulo: " | efficiency",
  scriptsComerciais: false,
  linksComerciais: false,
};

export function normalizarHost(host: string | null | undefined): string {
  return (host ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/:\d+$/, "");
}

export function hostsOperacionais(config: string | null | undefined): string[] {
  return (config ?? "").split(",").map(normalizarHost).filter(Boolean);
}

export function resolverBranding(
  host: string | null | undefined,
  configHostOperacional: string | null | undefined = import.meta.env.VITE_OPERATOR_PORTAL_HOST,
): Branding {
  const h = normalizarHost(host);
  const cfg = configHostOperacional?.trim() ? configHostOperacional : HOST_OPERACIONAL_PADRAO;
  if (h && hostsOperacionais(cfg).includes(h)) return BRANDING_OPERACIONAL;
  return BRANDING_COMERCIAL;
}

/** Únicas rotas acessíveis pelo host operacional; o resto redireciona para /operacao. */
export function rotaPermitidaNoPortal(pathname: string): boolean {
  return pathname === "/auth" || pathname === "/operacao" || pathname.startsWith("/operacao/");
}
