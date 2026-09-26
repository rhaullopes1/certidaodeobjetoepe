/**
 * Posts consolidados: cada chave é um slug antigo que foi absorvido por outra
 * página. O destino recebe o redirecionamento permanente (301) para concentrar
 * a autoridade em uma única URL por tema e evitar canibalização no Google.
 */
export const REDIRECIONAMENTOS_BLOG: Record<string, string> = {
  "para-que-serve-certidao-de-objeto-e-pe": "o-que-e-certidao-de-objeto-e-pe",
  "diferenca-certidao-de-objeto-e-pe-e-certidao-negativa": "certidao-objeto-e-pe-x-nada-consta",
  "certidao-narratoria-o-que-e": "o-que-e-certidao-narratoria",
};

export const destinoRedirecionamento = (slug: string) => REDIRECIONAMENTOS_BLOG[slug];
