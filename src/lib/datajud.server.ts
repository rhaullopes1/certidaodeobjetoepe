/**
 * Adaptador DataJud (API Pública do CNJ) — consulta determinística, sem IA.
 * Desativado enquanto DATAJUD_API_KEY não estiver configurada.
 * Endpoint opcional: DATAJUD_BASE_URL (padrão: https://api-publica.datajud.cnj.jus.br).
 */

export type DatajudStatus =
  | "nao_configurado"
  | "tribunal_nao_suportado"
  | "nao_encontrado"
  | "indisponivel"
  | "ok";

export interface DatajudResultado {
  status: DatajudStatus;
  fonte: string;
  consultado_em: string;
  orgaoJulgador: string | null;
  orgaoJulgadorCodigo: string | null;
  municipioIbge: string | null;
  sistema: string | null;
  classe: string | null;
  grau: string | null;
  erro?: string;
}

const PADRAO = "https://api-publica.datajud.cnj.jus.br";

function vazio(status: DatajudStatus, erro?: string): DatajudResultado {
  return {
    status,
    fonte: "DataJud CNJ — API Pública",
    consultado_em: new Date().toISOString(),
    orgaoJulgador: null,
    orgaoJulgadorCodigo: null,
    municipioIbge: null,
    sistema: null,
    classe: null,
    grau: null,
    ...(erro ? { erro } : {}),
  };
}

/** Alias do índice DataJud a partir da sigla do tribunal (ex.: TJSP → tjsp). */
export function aliasDatajud(sigla: string | null) {
  if (!sigla) return null;
  const s = sigla.trim().toLowerCase();
  return /^(tj[a-z]{2,3}|trf\d|trt\d{1,2}|tre-?[a-z]{2}|tjm[a-z]{2}|stj|tst|tse|stm)$/.test(s)
    ? s.replace("-", "-")
    : null;
}

export async function consultarDatajud(
  numero: string,
  tribunalSigla: string | null,
  opts: {
    apiKey?: string | null;
    baseUrl?: string | null;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<DatajudResultado> {
  const apiKey = opts.apiKey ?? process.env["DATAJUD_API_KEY"] ?? null;
  if (!apiKey) return vazio("nao_configurado");
  const alias = aliasDatajud(tribunalSigla);
  if (!alias) return vazio("tribunal_nao_suportado");

  const base = (opts.baseUrl ?? process.env["DATAJUD_BASE_URL"] ?? PADRAO).replace(/\/$/, "");
  const f = opts.fetchImpl ?? fetch;
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), opts.timeoutMs ?? 6000);
  try {
    const resp = await f(`${base}/api_publica_${alias}/_search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `APIKey ${apiKey}` },
      body: JSON.stringify({
        query: { match: { numeroProcesso: numero.replace(/\D/g, "") } },
        size: 1,
      }),
      signal: controle.signal,
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      return vazio("indisponivel", `HTTP ${resp.status} ${txt.slice(0, 200)}`);
    }
    const json = (await resp.json()) as {
      hits?: { hits?: { _source?: Record<string, any> }[] };
    };
    const src = json.hits?.hits?.[0]?._source;
    if (!src) return vazio("nao_encontrado");
    const orgao = src["orgaoJulgador"] ?? {};
    return {
      ...vazio("ok"),
      orgaoJulgador: typeof orgao.nome === "string" ? orgao.nome : null,
      orgaoJulgadorCodigo: orgao.codigo != null ? String(orgao.codigo) : null,
      municipioIbge: orgao.codigoMunicipioIBGE != null ? String(orgao.codigoMunicipioIBGE) : null,
      sistema: typeof src["sistema"]?.nome === "string" ? src["sistema"].nome : null,
      classe: typeof src["classe"]?.nome === "string" ? src["classe"].nome : null,
      grau: typeof src["grau"] === "string" ? src["grau"] : null,
    };
  } catch (e) {
    return vazio("indisponivel", e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(timer);
  }
}
