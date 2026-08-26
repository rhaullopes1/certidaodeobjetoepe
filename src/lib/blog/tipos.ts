export type Bloco =
  | { t: "p"; x: string }
  | { t: "h"; x: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "tabela"; head: string[]; rows: string[][] }
  | { t: "nota"; x: string }
  | { t: "cta"; x: string };

export interface FaqItem {
  q: string;
  a: string;
}

export interface Post {
  slug: string;
  categoria: string;
  titulo: string;
  h1: string;
  descricao: string;
  resumo: string;
  atualizado: string;
  leitura: number;
  blocos: Bloco[];
  faq: FaqItem[];
}

export interface Categoria {
  slug: string;
  nome: string;
  titulo: string;
  descricao: string;
  intro: string;
}
