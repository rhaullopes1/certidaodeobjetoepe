/**
 * Validação do documento oficial recebido (PDF emitido pelo tribunal).
 * Nunca altera o arquivo e nunca gera documento: apenas confere e extrai campos do texto real.
 */

export function ehPdf(bytes: Uint8Array) {
  // Assinatura "%PDF-" no início do arquivo.
  return bytes.length > 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

const soDigitos = (s: string) => s.replace(/\D/g, "");

export interface DadosExtraidos {
  textoExtraido: boolean;
  processos: string[];
  processoConfere: boolean | null;
  numeroCertidao: string | null;
  codigoSeguranca: string | null;
  mencionaNarratoria: boolean;
}

/** Extrai, do texto real do PDF, campos que existirem. Ausência = null (sem preenchimento artificial). */
export function extrairDadosNarratoria(texto: string, numeroEsperado: string): DadosExtraidos {
  const t = texto.replace(/\s+/g, " ").trim();
  if (!t) return { textoExtraido: false, processos: [], processoConfere: null, numeroCertidao: null, codigoSeguranca: null, mencionaNarratoria: false };
  const processos = [...new Set(t.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g) ?? [])];
  const esperado = soDigitos(numeroEsperado);
  const cert = t.match(/certid[aã]o\s*(?:narrat[oó]ria\s*)?(?:n[º°o.]*|n[uú]mero)\s*:?\s*([0-9][0-9./-]{3,})/i);
  const cod = t.match(/c[oó]digo\s*(?:de\s*)?(?:verifica[cç][aã]o|seguran[cç]a|autenticidade)[^A-Za-z0-9]{0,12}([A-Za-z0-9]{4,}(?:[-.][A-Za-z0-9]{2,})*)/i);
  return {
    textoExtraido: true,
    processos,
    processoConfere: processos.length ? processos.some((p) => soDigitos(p) === esperado) : null,
    numeroCertidao: cert?.[1]?.replace(/[./-]+$/, "") ?? null,
    codigoSeguranca: cod?.[1] ?? null,
    mencionaNarratoria: /narrat[oó]ria|objeto e p[eé]/i.test(t),
  };
}

export async function sha256Hex(bytes: Uint8Array) {
  const h = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const STATUS_AUTENTICIDADE = {
  nao_conferido: "Autenticidade NÃO conferida",
  conferido_valido: "Autenticidade conferida na consulta pública oficial",
  conferido_invalido: "Consulta oficial NÃO confirmou a autenticidade",
} as const;
export type StatusAutenticidade = keyof typeof STATUS_AUTENTICIDADE;
