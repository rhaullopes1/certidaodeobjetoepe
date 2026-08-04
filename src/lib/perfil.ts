import { supabase } from "@/integrations/supabase/client";

export type Perfil = {
  id: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  provider: string | null;
};

/**
 * Garante que o usuário logado tenha perfil no backend (nome, e-mail e provider).
 * O trigger do backend cria no primeiro login; aqui só sincronizamos caso falte.
 */
export async function carregarPerfil(): Promise<Perfil | null> {
  const { data: sessao } = await supabase.auth.getUser();
  const user = sessao.user;
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, nome, email, avatar_url, provider")
    .eq("id", user.id)
    .maybeSingle<Perfil>();

  if (data) return data;

  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const novo = {
    id: user.id,
    nome: meta.full_name ?? meta.name ?? (user.email ?? "").split("@")[0],
    email: user.email ?? null,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    provider: (user.app_metadata as { provider?: string } | undefined)?.provider ?? "email",
  };
  const { data: criado } = await supabase
    .from("profiles")
    .upsert(novo)
    .select("id, nome, email, avatar_url, provider")
    .maybeSingle<Perfil>();
  return criado ?? novo;
}

export function iniciais(perfil: Perfil | null) {
  const base = perfil?.nome || perfil?.email || "?";
  return base
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}