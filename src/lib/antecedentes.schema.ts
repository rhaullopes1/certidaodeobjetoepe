import { z } from "zod";
import { cpfField, nomeParteField, soDigitos } from "./pedidos.schema";
import { PRECO_ANTECEDENTES_CENTAVOS } from "./site";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

/** Data de nascimento em ISO 8601 (AAAA-MM-DD), entre 1900 e hoje. */
export const nascimentoField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento")
  .refine((v) => {
    const d = new Date(`${v}T12:00:00Z`);
    if (Number.isNaN(d.getTime())) return false;
    const ano = Number(v.slice(0, 4));
    return ano >= 1900 && d.getTime() <= Date.now();
  }, "Data de nascimento inválida");

const nomeOpcional = z
  .string()
  .trim()
  .max(120, "Nome muito longo")
  .optional()
  .or(z.literal(""));

export const antecedentesSchema = z.object({
  nome: nomeParteField,
  cpf: cpfField,
  nascimento: nascimentoField,
  nomeMae: nomeOpcional,
  nomePai: nomeOpcional,
  ufNascimento: z.enum(UFS, { message: "Selecione o estado de nascimento" }),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => {
      const d = soDigitos(v);
      return d.length === 10 || d.length === 11;
    }, "Informe o WhatsApp com DDD"),
  valorTotalCentavos: z
    .number()
    .int()
    .refine((v) => v === PRECO_ANTECEDENTES_CENTAVOS, "Valor do pedido inválido"),
});

export type AntecedentesPedidoInput = z.infer<typeof antecedentesSchema>;
