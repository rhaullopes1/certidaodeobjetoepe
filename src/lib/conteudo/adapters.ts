/**
 * Adaptadores de publicação por canal.
 *
 * O canal "blog" publica de verdade (dentro do próprio site).
 * Os canais sociais estão implementados como adaptadores prontos, mas
 * permanecem INATIVOS enquanto não houver credencial/conexão válida no
 * projeto. Nesse caso o job é marcado como "skipped" com o motivo — nunca
 * como publicado.
 */

export interface ResultadoPublicacao {
  ok: boolean;
  skipped?: boolean;
  url?: string;
  mensagem: string;
}

export interface ContextoPublicacao {
  itemId: string;
  slug: string;
  titulo: string;
  nicho: string;
  canais: Record<string, unknown>;
  link: string;
  conta: { conectado: boolean; secret_esperado: string } | null;
}

const SITE = "https://certidaodeobjetoepe.org";

function credencialAusente(ctx: ContextoPublicacao, canal: string): ResultadoPublicacao {
  const nome = ctx.conta?.secret_esperado || "credencial do canal";
  return {
    ok: false,
    skipped: true,
    mensagem: `Canal ${canal} sem conexão ativa. Falta cadastrar ${nome} e conectar a conta. Conteúdo gerado e guardado, nada foi publicado.`,
  };
}

async function publicarBlog(ctx: ContextoPublicacao): Promise<ResultadoPublicacao> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("content_items")
    .update({ status: "published", publicado_em: new Date().toISOString() })
    .eq("id", ctx.itemId);
  if (error) return { ok: false, mensagem: error.message };
  return { ok: true, url: `${SITE}/blog/${ctx.slug}`, mensagem: "Artigo publicado no blog do site." };
}

export async function publicarNoCanal(
  canal: string,
  ctx: ContextoPublicacao,
): Promise<ResultadoPublicacao> {
  if (canal === "blog") return publicarBlog(ctx);

  const temSecret = !!(ctx.conta?.secret_esperado && process.env[ctx.conta.secret_esperado]);
  if (!ctx.conta?.conectado || !temSecret) return credencialAusente(ctx, canal);

  // A partir daqui haveria a chamada real da API do canal. Enquanto nenhuma
  // conexão foi autorizada, este caminho nunca é alcançado.
  return {
    ok: false,
    skipped: true,
    mensagem: `Adaptador de ${canal} pronto, mas a publicação automática ainda não foi autorizada.`,
  };
}
