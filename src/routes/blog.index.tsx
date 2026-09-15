import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { CATEGORIAS, POSTS, postsPorCategoria } from "@/lib/blog";
import { adsenseScripts } from "@/lib/adsense";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/blog`;
const TITLE = "Blog Certidão de Objeto e Pé: guias por tribunal e por uso";
const DESC =
  "Guias completos sobre Certidão de Objeto e Pé: o que é, como emitir em cada tribunal e sistema, ramos da Justiça, situações em que é exigida e dúvidas frequentes.";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const { listarPostsPublicados } = await import("@/lib/blog/publicados");
    return { recentes: await listarPostsPublicados(12) };
  },
  head: () => ({

    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "pt-BR", href: URL },
      { rel: "alternate", hrefLang: "x-default", href: URL },
    ],
    scripts: [
      ...adsenseScripts,
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "@id": `${URL}#blog`,
          name: "Blog Certidão de Objeto e Pé",
          url: URL,
          inLanguage: "pt-BR",
          description: DESC,
          blogPost: POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.titulo,
            url: `${SITE}/blog/${p.slug}`,
            datePublished: p.atualizado,
            dateModified: p.atualizado,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE },
            { "@type": "ListItem", position: 2, name: "Blog", item: URL },
          ],
        }),
      },
    ],
  }),
  component: BlogHub,
});

function BlogHub() {
  const { recentes } = Route.useLoaderData();
  return (

    <PageShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
          Blog Certidão de Objeto e Pé
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {DESC}
        </p>

        <nav aria-label="Categorias" className="mt-8 flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              to="/blog/categoria/$slug"
              params={{ slug: c.slug }}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {c.nome}
            </Link>
          ))}
          <Link
            to="/tribunais"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Todos os tribunais
          </Link>
        </nav>

        {recentes.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold">Publicações recentes</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentes.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="block h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {new Date(p.atualizado).toLocaleDateString("pt-BR")}
                    </span>
                    <h3 className="mt-3 text-lg font-bold leading-snug">{p.titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.resumo}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}



        {CATEGORIAS.map((c) => {
          const posts = postsPorCategoria(c.slug);
          if (posts.length === 0) return null;
          return (
            <section key={c.slug} className="mt-14">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-bold">{c.nome}</h2>
                <Link
                  to="/blog/categoria/$slug"
                  params={{ slug: c.slug }}
                  className="text-sm font-semibold text-gold hover:underline"
                >
                  Ver todos
                </Link>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{c.intro}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      className="block h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {p.leitura} min de leitura
                      </span>
                      <h3 className="mt-3 text-lg font-bold leading-snug">{p.titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.resumo}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
