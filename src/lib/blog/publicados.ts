import { supabase } from "@/integrations/supabase/client";
import type { Bloco, FaqItem, Post } from "./tipos";

/** Artigos gerados pela Central de Conteúdo e já publicados. */
export interface PostPublicado extends Post {
  nicho: string;
  origem: "central";
}

function mapear(row: {
  slug: string;
  titulo: string;
  meta_description: string;
  resumo: string;
  blocos: unknown;
  faq: unknown;
  canais: unknown;
  nicho: string;
  publicado_em: string | null;
  created_at: string;
}): PostPublicado {
  const canais = (row.canais ?? {}) as { h1?: string };
  const blocos = Array.isArray(row.blocos) ? (row.blocos as Bloco[]) : [];
  const texto = blocos.reduce((n, b) => n + ("x" in b ? b.x.length : 0), 0);
  return {
    slug: row.slug,
    categoria: "usos",
    titulo: row.titulo,
    h1: canais.h1 ?? row.titulo,
    descricao: row.meta_description,
    resumo: row.resumo,
    atualizado: (row.publicado_em ?? row.created_at).slice(0, 10),
    leitura: Math.max(3, Math.round(texto / 1100)),
    blocos,
    faq: Array.isArray(row.faq) ? (row.faq as FaqItem[]) : [],
    nicho: row.nicho,
    origem: "central",
  };
}

const COLUNAS =
  "slug, titulo, meta_description, resumo, blocos, faq, canais, nicho, publicado_em, created_at";

export async function postPublicadoPorSlug(slug: string): Promise<PostPublicado | null> {
  const { data } = await supabase
    .from("content_items")
    .select(COLUNAS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapear(data as never) : null;
}

export async function listarPostsPublicados(limite = 30): Promise<PostPublicado[]> {
  const { data } = await supabase
    .from("content_items")
    .select(COLUNAS)
    .eq("status", "published")
    .order("publicado_em", { ascending: false })
    .limit(limite);
  return (data ?? []).map((r) => mapear(r as never));
}
