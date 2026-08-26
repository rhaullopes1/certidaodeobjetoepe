import { z } from "zod";
import { QUANTIDADE_MAXIMA, TABELA_PRECOS, precoCentavos } from "./site";

export const soDigitos = (v: string) => v.replace(/\D/g, "");

export function cpfValido(raw: string) {
  const cpf = soDigitos(raw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (base: number) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(cpf[i]) * (base + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

/** Nome válido: 2+ palavras, apenas letras/acentos/apóstrofo/hífen. */
export function nomeCompletoValido(raw: string) {
  const v = raw.trim().replace(/\s+/g, " ");
  if (v.length < 5 || v.length > 120) return false;
  if (!/^[A-Za-zÀ-ÿ'´`^~.\- ]+$/.test(v)) return false;
  const partes = v.split(" ").filter((p) => p.replace(/[.'´`^~-]/g, "").length >= 2);
  return partes.length >= 2;
}

/** Número de processo válido: 10 a 25 dígitos (aceita CNJ formatado). */
export function numeroProcessoValido(raw: string) {
  const v = raw.trim();
  if (v.length < 10 || v.length > 40) return false;
  if (!/^[0-9.\-/ ]+$/.test(v)) return false;
  const d = soDigitos(v);
  return d.length >= 10 && d.length <= 25;
}

export const numeroProcessoField = z
  .string()
  .trim()
  .min(10, "Informe o número do processo")
  .max(40, "Número do processo muito longo")
  .refine(numeroProcessoValido, "Número do processo inválido");

export const nomeParteField = z
  .string()
  .trim()
  .min(5, "Informe o nome completo da parte envolvida")
  .max(120, "Nome muito longo")
  .refine(nomeCompletoValido, "Informe o nome completo (nome e sobrenome, sem números)");

export const cpfField = z.string().trim().refine(cpfValido, "CPF inválido");

export const certidaoSchema = z.object({
  numeroProcesso: numeroProcessoField,
  nomeParte: nomeParteField,
  cpf: cpfField,
});

export type CertidaoInput = z.infer<typeof certidaoSchema>;

export const pedidoSchema = z
  .object({
    numeroProcesso: numeroProcessoField,
    nomeParte: nomeParteField,
    cpf: cpfField,
    /** Uma entrada por certidão solicitada (a primeira repete os dados acima). */
    certidoes: z.array(certidaoSchema).min(1).max(QUANTIDADE_MAXIMA),
    quantidade: z.coerce
      .number()
      .int("Quantidade inválida")
      .min(1, "Selecione ao menos 1 certidão")
      .max(QUANTIDADE_MAXIMA, `Máximo de ${QUANTIDADE_MAXIMA} certidões por pedido`)
      .refine((q) => q in TABELA_PRECOS, "Quantidade sem preço disponível"),
    /** Valor total mostrado ao cliente; conferido contra a tabela oficial. */
    valorTotalCentavos: z.coerce.number().int().positive(),
    email: z.string().trim().email("E-mail inválido").max(255),
    whatsapp: z
      .string()
      .trim()
      .refine((v) => soDigitos(v).length >= 10 && soDigitos(v).length <= 13, "WhatsApp inválido"),
    observacoes: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .superRefine((valor, ctx) => {
    const esperado = precoCentavos(valor.quantidade);
    if (valor.valorTotalCentavos !== esperado) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valorTotalCentavos"],
        message: "O valor exibido não corresponde à quantidade selecionada. Recarregue a página.",
      });
    }
    if (valor.certidoes.length !== valor.quantidade) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["certidoes"],
        message: "Preencha os dados de cada certidão solicitada.",
      });
    }
  });

/** Primeira etapa: dados do processo, antes de exibir o valor. */
export const etapaProcessoSchema = z.object({
  numeroProcesso: numeroProcessoField,
  nomeParte: nomeParteField,
  cpf: cpfField,
});

export type EtapaProcessoInput = z.infer<typeof etapaProcessoSchema>;

export type PedidoInput = z.infer<typeof pedidoSchema>;