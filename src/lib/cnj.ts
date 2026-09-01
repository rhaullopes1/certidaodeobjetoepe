/**
 * Decodificação do Número Único de Processo (NUP) — Resolução CNJ 65/2008.
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 */

export const soDigitosCNJ = (v: string) => v.replace(/\D/g, "");

export interface PartesNup {
  numero: string;
  digito: string;
  ano: number;
  segmento: number;
  codigoTribunal: string;
  codigoOrigem: string;
  formatado: string;
  digitoValido: boolean;
}

/** Formata 20 dígitos no padrão CNJ. */
export function formatarNup(raw: string) {
  const d = soDigitosCNJ(raw).slice(0, 20);
  let out = d.slice(0, 7);
  if (d.length > 7) out += "-" + d.slice(7, 9);
  if (d.length > 9) out += "." + d.slice(9, 13);
  if (d.length > 13) out += "." + d.slice(13, 14);
  if (d.length > 14) out += "." + d.slice(14, 16);
  if (d.length > 16) out += "." + d.slice(16, 20);
  return out;
}

/** Dígito verificador oficial (Módulo 97 Base 10 — ISO 7064). */
export function digitoVerificadorNup(
  numero: string,
  ano: string,
  segmento: string,
  tribunal: string,
  origem: string,
) {
  const base = `${numero}${ano}${segmento}${tribunal}${origem}00`;
  let resto = 0;
  for (const ch of base) resto = (resto * 10 + Number(ch)) % 97;
  const dv = 98 - resto;
  return String(dv).padStart(2, "0");
}

/** Extrai as partes do NUP. Retorna null quando não há 20 dígitos. */
export function analisarNup(raw: string): PartesNup | null {
  const d = soDigitosCNJ(raw);
  if (d.length !== 20) return null;
  const numero = d.slice(0, 7);
  const digito = d.slice(7, 9);
  const ano = d.slice(9, 13);
  const segmento = d.slice(13, 14);
  const codigoTribunal = d.slice(14, 16);
  const codigoOrigem = d.slice(16, 20);
  return {
    numero,
    digito,
    ano: Number(ano),
    segmento: Number(segmento),
    codigoTribunal,
    codigoOrigem,
    formatado: formatarNup(d),
    digitoValido: digitoVerificadorNup(numero, ano, segmento, codigoTribunal, codigoOrigem) === digito,
  };
}
