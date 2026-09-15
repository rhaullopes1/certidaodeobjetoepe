import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { BlogContent } from "@/components/blog/blog-content";
import { LinksRelacionados } from "@/components/site/links-relacionados";
import {
  categoriaPorSlug,
  destinoRedirecionamento,
  postPorSlug,
  postsRelacionados,
} from "@/lib/blog";
import { adsenseScripts } from "@/lib/adsense";

const SITE = "https://certidaodeobjetoepe.org";

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    const destino = destinoRedirecionamento(params.slug);
    if (destino) {
      throw redirect({
        to: "/blog/$slug",
        params: { slug: destino },
        statusCode: 301,
      });

    }
  },
  loader: async ({ params }) => {
    const post = postPorSlug(params.slug);
    if (post) {
      return {
        post,
        categoria: categoriaPorSlug(post.categoria),
        relacionados: postsRelacionados(post),
      };
    }
    const { postPublicadoPorSlug, listarPostsPublicados } = await import("@/lib/blog/publicados");
    const publicado = await postPublicadoPorSlug(params.slug);
    if (!publicado) throw notFound();
    const outros = await listarPostsPublicados(8);
    return {
      post: publicado,
      categoria: categoriaPorSlug(publicado.categoria),
      relacionados: outros.filter((p) => p.slug !== publicado.slug).slice(0, 3),
    };
  },


  head: ({ params, loaderData }) => {
    const url = `${SITE}/blog/${params.slug}`;
    if (!loaderData) {
      return { meta: [{ title: "Artigo não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const { post, categoria } = loaderData;
    return {
      meta: [
        { title: post.titulo },
        { name: "description", content: post.descricao },
        { property: "og:title", content: post.titulo },
        { property: "og:description", content: post.descricao },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "pt_BR" },
        { property: "article:modified_time", content: post.atualizado },
        { property: "og:image", content: `${SITE}/og-certidao.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `${SITE}/og-certidao.jpg` },
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
            "@type": "Article",
            "@id": `${url}#article`,
            headline: post.titulo,
            description: post.descricao,
            image: `${SITE}/og-certidao.jpg`,
            inLanguage: "pt-BR",
            datePublished: post.atualizado,
            dateModified: post.atualizado,
            mainEntityOfPage: url,
            author: { "@id": `${SITE}/#organization` },
            publisher: { "@id": `${SITE}/#organization` },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
              ...(categoria
                ? [{
                    "@type": "ListItem",
                    position: 3,
                    name: categoria.nome,
                    item: `${SITE}/blog/categoria/${categoria.slug}`,
                  }]
                : []),
              { "@type": "ListItem", position: categoria ? 4 : 3, name: post.titulo, item: url },
            ],
          }),
        },
        ...(post.faq.length
          ? [{
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                inLanguage: "pt-BR",
                mainEntity: post.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }]
          : []),
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post, categoria, relacionados } = Route.useLoaderData();
  return (
    <PageShell>
      <article className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 lg:py-20">
        <nav className="text-sm text-muted-foreground">
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          {categoria ? (
            <>
              <span className="px-2">/</span>
              <Link
                to="/blog/categoria/$slug"
                params={{ slug: categoria.slug }}
                className="hover:text-foreground"
              >
                {categoria.nome}
              </Link>
            </>
          ) : null}
        </nav>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">{post.h1}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.resumo}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Atualizado em {new Date(post.atualizado).toLocaleDateString("pt-BR")} · {post.leitura} min de leitura
        </p>

        <BlogContent blocos={post.blocos} />

        {post.faq.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold">Perguntas frequentes</h2>
            <dl className="mt-6 space-y-5">
              {post.faq.map((f) => (
                <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {relacionados.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold">Leia também</h2>
            <ul className="mt-5 space-y-3">
              {relacionados.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: r.slug }}
                    className="block rounded-2xl border border-border p-5 transition-colors hover:bg-secondary"
                  >
                    <span className="font-semibold">{r.titulo}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{r.resumo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-14 rounded-2xl surface-navy p-8">
          <h2 className="font-display text-xl font-bold">Solicite sua Certidão de Objeto e Pé</h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
            Informe número do processo, nome completo e CPF da parte. Cuidamos do pedido junto ao tribunal
            e entregamos o documento digital.
          </p>
          <Link
            to="/solicitar"
            className="mt-5 inline-flex items-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-accent-foreground"
          >
            Solicitar agora
          </Link>
        </div>

        <LinksRelacionados className="mt-14" />
      </article>
    </PageShell>
  );
}
