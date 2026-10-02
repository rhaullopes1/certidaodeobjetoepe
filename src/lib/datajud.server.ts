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
  | "limite_requisicoes"
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
  numeroProcesso: string | null;
  tribunal: string | null;
  dataAjuizamento: string | null;
  assuntos: string[];
  ultimosMovimentos: { nome: string; dataHora: string | null }[];
  /** Nível de sigilo informado pela fonte (0 = público). null = não informado. */
  nivelSigilo: number | null;
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
    numeroProcesso: null,
    tribunal: null,
    dataAjuizamento: null,
    assuntos: [],
    ultimosMovimentos: [],
    nivelSigilo: null,
    ...(erro ? { erro } : {}),
  };
}

const UFS = ["ac","al","am","ap","ba","ce","df","es","go","ma","mg","ms","mt","pa","pb","pe","pi","pr","rj","rn","ro","rr","rs","sc","se","sp","to"];
/** Aliases publicados na documentação oficial da API Pública DataJud. */
export const ALIASES_DATAJUD = new Set<string>([
  "stj", "tst", "tse", "stm",
  ...UFS.filter((u) => u !== "df").map((u) => `tj${u}`), "tjdft",
  ...[1, 2, 3, 4, 5, 6].map((n) => `trf${n}`),
  ...Array.from({ length: 24 }, (_, i) => `trt${i + 1}`),
  ...UFS.map((u) => `tre-${u}`),
  "tjmmg", "tjmrs", "tjmsp",
]);

/** Alias do índice DataJud a partir da sigla do tribunal (ex.: TJSP → tjsp, TRE-SP → tre-sp). */
export function aliasDatajud(sigla: string | null) {
  if (!sigla) return null;
  let s = sigla.trim().toLowerCase().replace(/\s+/g, "");
  if (/^tre[a-z]{2}$/.test(s)) s = `tre-${s.slice(3)}`;
  if (s === "tjdf") s = "tjdft"; // sigla interna TJDF → alias oficial tjdft
  return ALIASES_DATAJUD.has(s) ? s : null;
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
    if (resp.status === 429) return vazio("limite_requisicoes", "HTTP 429");
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      return vazio("indisponivel", `HTTP ${resp.status} ${txt.slice(0, 200)}`);
    }
    const json = (await resp.json()) as {
      hits?: { hits?: { _source?: Record<string, any> }[] };
    };
    const src = json.hits?.hits?.[0]?._source;
    if (!src) return vazio("nao_encontrado");
    // Só aceita a resposta se corresponder exatamente ao processo consultado.
    const digitos = numero.replace(/\D/g, "");
    if (String(src["numeroProcesso"] ?? "").replace(/\D/g, "") !== digitos) {
      return vazio("nao_encontrado", "Resposta não corresponde ao número consultado.");
    }
    const assuntos = Array.isArray(src["assuntos"])
      ? (src["assuntos"] as any[]).map((a) => a?.nome).filter((n): n is string => typeof n === "string")
      : [];
    const movimentos = Array.isArray(src["movimentos"])
      ? (src["movimentos"] as any[])
          .filter((m) => typeof m?.nome === "string")
          .map((m) => ({ nome: m.nome as string, dataHora: typeof m.dataHora === "string" ? m.dataHora : null }))
          .sort((x, y) => String(y.dataHora).localeCompare(String(x.dataHora)))
          .slice(0, 5)
      : [];
    const orgao = src["orgaoJulgador"] ?? {};
    return {
      ...vazio("ok"),
      orgaoJulgador: typeof orgao.nome === "string" ? orgao.nome : null,
      orgaoJulgadorCodigo: orgao.codigo != null ? String(orgao.codigo) : null,
      municipioIbge: orgao.codigoMunicipioIBGE != null ? String(orgao.codigoMunicipioIBGE) : null,
      sistema: typeof src["sistema"]?.nome === "string" ? src["sistema"].nome : null,
      classe: typeof src["classe"]?.nome === "string" ? src["classe"].nome : null,
      grau: typeof src["grau"] === "string" ? src["grau"] : null,
      numeroProcesso: digitos,
      tribunal: typeof src["tribunal"] === "string" ? src["tribunal"] : null,
      dataAjuizamento: typeof src["dataAjuizamento"] === "string" ? src["dataAjuizamento"] : null,
      assuntos,
      ultimosMovimentos: movimentos,
      nivelSigilo: typeof src["nivelSigilo"] === "number" ? src["nivelSigilo"] : null,
    };
  } catch (e) {
    return vazio("indisponivel", e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(timer);
  }
}
