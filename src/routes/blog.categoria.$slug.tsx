import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { LinksRelacionados } from "@/components/site/links-relacionados";
import { CATEGORIAS, categoriaPorSlug, postsPorCategoria } from "@/lib/blog";
import { adsenseScripts } from "@/lib/adsense";

const SITE = "https://certidaodeobjetoepe.org";

export const Route = createFileRoute("/blog/categoria/$slug")({
  loader: ({ params }) => {
    const categoria = categoriaPorSlug(params.slug);
    if (!categoria) throw notFound();
    return { categoria, posts: postsPorCategoria(categoria.slug) };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/blog/categoria/${params.slug}`;
    if (!loaderData) {
      return { meta: [{ title: "Categoria não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const { categoria } = loaderData;
    return {
      meta: [
        { title: categoria.titulo },
        { name: "description", content: categoria.descricao },
        { property: "og:title", content: categoria.titulo },
        { property: "og:description", content: categoria.descricao },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "pt_BR" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "pt-BR", href: url },
        { rel: "alternate", hrefLang: "x-default", href: url },
      ],
      scripts: [
        ...adsenseScripts,
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
              { "@type": "ListItem", position: 3, name: categoria.nome, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: CategoriaPage,
});

function CategoriaPage() {
  const { categoria, posts } = Route.useLoaderData();
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <nav className="text-sm text-muted-foreground">
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <span className="px-2">/</span>
          <span>{categoria.nome}</span>
        </nav>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          {categoria.titulo}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{categoria.intro}</p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <h2 className="mt-3 text-lg font-bold leading-snug">{p.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.resumo}</p>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 text-xl font-bold">Outras categorias</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {CATEGORIAS.filter((c) => c.slug !== categoria.slug).map((c) => (
            <li key={c.slug}>
              <Link
                to="/blog/categoria/$slug"
                params={{ slug: c.slug }}
                className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                {c.nome}
              </Link>
            </li>
          ))}
        </ul>

        <LinksRelacionados className="mt-14" />
      </div>
    </PageShell>
  );
}
