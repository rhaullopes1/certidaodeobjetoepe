import { z } from "zod";

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

export const pedidoSchema = z.object({
  numeroProcesso: z
    .string()
    .trim()
    .min(10, "Informe o número do processo")
    .max(40, "Número do processo muito longo"),
  nomeParte: z
    .string()
    .trim()
    .min(5, "Informe o nome completo da parte envolvida")
    .max(120, "Nome muito longo")
    .refine((v) => v.split(/\s+/).length >= 2, "Informe o nome completo"),
  cpf: z.string().trim().refine(cpfValido, "CPF inválido"),
  quantidade: z.coerce.number().int().min(1).max(5),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => soDigitos(v).length >= 10 && soDigitos(v).length <= 13, "WhatsApp inválido"),
  observacoes: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** Primeira etapa: dados do processo, antes de exibir o valor. */
export const etapaProcessoSchema = pedidoSchema.pick({
  numeroProcesso: true,
  nomeParte: true,
  cpf: true,
});

export type EtapaProcessoInput = z.infer<typeof etapaProcessoSchema>;

export type PedidoInput = z.infer<typeof pedidoSchema>;