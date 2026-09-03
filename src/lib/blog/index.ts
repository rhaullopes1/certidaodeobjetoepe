import type { Post } from "./tipos";
import { POSTS_CONCEITO } from "./posts-conceito";
import { POSTS_TRIBUNAIS } from "./posts-tribunais";
import { POSTS_RAMOS } from "./posts-ramos";
import { POSTS_USOS } from "./posts-usos";
import { POSTS_DUVIDAS } from "./posts-duvidas";

export * from "./tipos";
export { CATEGORIAS, categoriaPorSlug } from "./categorias";
export { REDIRECIONAMENTOS_BLOG, destinoRedirecionamento } from "./redirecionamentos";


export const POSTS: Post[] = [
  ...POSTS_CONCEITO,
  ...POSTS_TRIBUNAIS,
  ...POSTS_RAMOS,
  ...POSTS_USOS,
  ...POSTS_DUVIDAS,
];

export const postPorSlug = (slug: string) => POSTS.find((p) => p.slug === slug);

export const postsPorCategoria = (categoria: string) =>
  POSTS.filter((p) => p.categoria === categoria);

export const postsRelacionados = (post: Post, limite = 3) =>
  POSTS.filter((p) => p.categoria === post.categoria && p.slug !== post.slug).slice(0, limite);
