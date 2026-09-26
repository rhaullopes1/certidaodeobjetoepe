import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { TRIBUNAIS, tribunalPorSlug, tribunaisPorTipo, type Tribunal } from "@/lib/tribunais";
import { whatsappLink } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { LinksRelacionados } from "@/components/site/links-relacionados";

const SITE = "https://certidaodeobjetoepe.org";

const faqTribunal = (t: Tribunal) => [
  {
    q: `Como solicitar a Certidão de Objeto e Pé no ${t.sigla}?`,
    a: `Basta informar o número do processo, o nome completo e o CPF da parte. Identificamos a vara no sistema ${t.sistema}, protocolamos o requerimento no ${t.nome} e entregamos a certidão digital.`,
  },
  {
    q: `Quanto tempo demora a certidão no ${t.sigla}?`,
    a: `O prazo médio no ${t.sigla} é de ${t.prazo}, contados da protocolização. Processos físicos ou arquivados podem exigir desarquivamento e levar mais tempo.`,
  },
  {
    q: `Qual sistema o ${t.sigla} utiliza?`,
    a: `O ${t.nome} utiliza o sistema ${t.sistema} para consulta processual e peticionamento eletrônico.`,
  },
  {
    q: `Preciso de advogado para pedir a certidão no ${t.sigla}?`,
    a: "Não. Em processos públicos qualquer pessoa pode requerer a certidão. Advogado ou procuração só é necessário em processos que tramitam em segredo de justiça.",
  },
  {
    q: `Quanto custa a certidão do ${t.sigla}?`,
    a: "O valor é por certidão, com desconto progressivo até cinco certidões no mesmo pedido, e é apresentado no resumo do pedido logo após o preenchimento da solicitação, antes de qualquer pagamento. Eventuais custas do tribunal são informadas antes do protocolo.",
  },
  {
    q: `A certidão do ${t.sigla} é digital e válida?`,
    a: "Sim. O documento é expedido em PDF assinado digitalmente, com código de autenticidade conferível no portal do tribunal.",
  },
  {
    q: `Atendem processos de todas as comarcas do ${t.sigla}?`,
    a: `Sim. Atendemos ${t.abrangencia}, incluindo ${t.comarcas.slice(0, 4).join(", ")} e demais unidades jurisdicionais.`,
  },
];

export const Route = createFileRoute("/tribunais/$sigla")({
  loader: ({ params }) => {
    const tribunal = tribunalPorSlug(params.sigla);
    if (!tribunal) throw notFound();
    return {
      tribunal,
      relacionados: tribunaisPorTipo(tribunal.tipo)
        .filter((t) => t.slug !== tribunal.slug)
        .slice(0, 8),
    };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/tribunais/${params.sigla.toLowerCase()}`;
    if (!loaderData) {
      return { meta: [{ title: "Tribunal não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const t = loaderData.tribunal;
    const title = `Certidão de Objeto e Pé ${t.sigla} — ${t.nome}`;
    const desc = `Solicite a Certidão de Objeto e Pé de processos do ${t.sigla} (${t.nome}). Sistema ${t.sistema}, prazo médio de ${t.prazo}, atendimento online em ${t.abrangencia}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
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
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LegalService",
            "@id": `${url}#service`,
            name: `Certidão de Objeto e Pé ${t.sigla}`,
            description: desc,
            url,
            areaServed: { "@type": "AdministrativeArea", name: t.abrangencia },
            provider: { "@id": `${SITE}/#organization` },
            availableChannel: {
              "@type": "ServiceChannel",
              serviceUrl: `${SITE}/solicitar`,
              availableLanguage: ["Portuguese"],
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: SITE },
              { "@type": "ListItem", position: 2, name: "Tribunais", item: `${SITE}/tribunais` },
              { "@type": "ListItem", position: 3, name: t.sigla, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            inLanguage: "pt-BR",
            mainEntity: faqTribunal(t).map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: TribunalPage,
});

function TribunalPage() {
  const { tribunal: t, relacionados } = Route.useLoaderData();
  const wpp = whatsappLink(
    `Olá! Preciso de uma Certidão de Objeto e Pé de processo do ${t.sigla}.`,
  );
  const faq = faqTribunal(t);

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 lg:py-20">
        <nav className="text-sm text-muted-foreground">
          <Link to="/tribunais" className="hover:text-foreground">Tribunais</Link>
          <span className="px-2">/</span>
          <span>{t.sigla}</span>
        </nav>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
          Certidão de Objeto e Pé {t.sigla} — {t.nome}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">{t.resumo}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/solicitar"
            className="inline-flex items-center rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-accent-foreground"
          >
            Solicitar certidão do {t.sigla}
          </Link>
          <a
            href={wpp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-border px-6 py-3.5 text-sm font-semibold hover:bg-secondary"
          >
            Falar no WhatsApp
          </a>
        </div>
        <AlternativasContato className="mt-4" />

        <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Sistema processual", t.sistema],
            ["Prazo médio", t.prazo],
            ["Abrangência", t.abrangencia],
            ["Sede", t.sede],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border bg-card p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{k}</dt>
              <dd className="mt-2 text-sm font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Como funciona no {t.sigla}</h2>
          <ol className="mt-5 space-y-3 pl-5 text-base leading-relaxed text-muted-foreground">
            <li className="list-decimal">Você envia o número do processo, o nome completo e o CPF da parte.</li>
            <li className="list-decimal">Localizamos o processo no sistema {t.sistema} e confirmamos a vara competente.</li>
            <li className="list-decimal">Protocolamos o requerimento de certidão e recolhemos as custas, se houver.</li>
            <li className="list-decimal">Acompanhamos a expedição pela secretaria, com prazo médio de {t.prazo}.</li>
            <li className="list-decimal">Entregamos o PDF assinado, com código de autenticidade conferível no portal do tribunal.</li>
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Comarcas e unidades atendidas</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {t.comarcas.map((c) => (
              <li key={c} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Atendemos {t.abrangencia}, inclusive comarcas do interior e processos físicos arquivados.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Perguntas frequentes sobre o {t.sigla}</h2>
          <dl className="mt-6 space-y-5">
            {faq.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Outros tribunais</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {relacionados.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/tribunais/$sigla"
                  params={{ sigla: r.slug }}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {r.sigla}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Veja a lista completa dos {TRIBUNAIS.length} tribunais atendidos em{" "}
            <Link to="/tribunais" className="font-semibold text-gold hover:underline">
              todos os tribunais
            </Link>
            , ou leia os guias do{" "}
            <Link to="/blog" className="font-semibold text-gold hover:underline">
              blog
            </Link>
            .
          </p>
        </section>

        <LinksRelacionados className="mt-14" />
      </div>
    </PageShell>
  );
}
