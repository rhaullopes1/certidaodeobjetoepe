import { Link } from "@tanstack/react-router";
import { Scale, MessageCircle, Phone, MapPin, Landmark, FileText, Info } from "lucide-react";
import { whatsappLink, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { UserMenu } from "@/components/user-menu";

const SITE = "https://certidaodeobjetoepe.org";
export const TJRJ_URL = `${SITE}/certidao-de-objeto-e-pe/rj`;
const URL = TJRJ_URL;
const TITLE = "Certidão de Objeto e Pé RJ (TJRJ): Como Solicitar Online";
const DESC =
  "Como solicitar a Certidão de Objeto e Pé de processos do TJRJ, no Rio de Janeiro: quem emite, dados necessários, PJe e eproc, 2º grau, processos arquivados e acompanhamento.";

const COMARCAS = [
  "Rio de Janeiro (Capital)",
  "Niterói",
  "São Gonçalo",
  "Duque de Caxias",
  "Nova Iguaçu",
  "Campos dos Goytacazes",
  "Petrópolis",
  "Volta Redonda",
];

const FAQ_TJRJ: { q: string; a: string }[] = [
  {
    q: "O que é a Certidão de Objeto e Pé no TJRJ?",
    a: "É uma certidão judicial emitida pelo Tribunal de Justiça do Estado do Rio de Janeiro que informa o objeto da ação, as partes e a situação atual do processo. Ela apenas descreve o processo; não o encerra nem o remove.",
  },
  {
    q: "Quem emite a certidão?",
    a: "A unidade judicial do TJRJ onde o processo tramita ou tramitou (cartório da vara no 1º grau ou secretaria do órgão julgador no 2º grau). O certidaodeobjetoepe.org não é órgão público: fazemos a solicitação por você e acompanhamos o pedido.",
  },
  {
    q: "Que dados preciso informar?",
    a: "O número do processo e o nome da parte. Com eles localizamos a comarca, a unidade e o sistema em que o processo está. Se você não tiver o número, fale com a nossa equipe antes de pedir.",
  },
  {
    q: "É possível pedir para processo eletrônico?",
    a: "Sim. No TJRJ, processos eletrônicos tramitam no PJe, no Portal de Serviços e, de forma gradativa desde 2024, no eproc. Identificamos o sistema do seu processo antes de fazer o pedido.",
  },
  {
    q: "E para processo físico ou arquivado?",
    a: "Também é possível, mas o atendimento depende da unidade judicial. Processos arquivados podem precisar de desarquivamento, que tem custas próprias na tabela do TJRJ, e costumam levar mais tempo.",
  },
  {
    q: "O que acontece em processo sob segredo de justiça?",
    a: "O acesso é restrito. Em regra, a certidão só pode ser fornecida a quem tem legitimidade no processo, e a emissão depende da análise da unidade judicial.",
  },
  {
    q: "A certidão do TJRJ é usada em compra e venda de imóvel?",
    a: "Pode ser pedida. Quando aparece ação em nome do vendedor, cartórios e bancos costumam solicitar a certidão para entender o objeto e a situação do processo.",
  },
  {
    q: "Quanto tempo demora?",
    a: "O prazo de emissão é de 1 a 5 dias úteis, conforme a comarca e o tribunal emissor.",
  },
];

export function tjrjHead() {
  return {
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "pt-BR", href: URL },
      { rel: "alternate", hrefLang: "x-default", href: URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${URL}#webpage`,
          url: URL,
          name: TITLE,
          description: DESC,
          inLanguage: "pt-BR",
          about: { "@type": "GovernmentOrganization", name: "Tribunal de Justiça do Estado do Rio de Janeiro" },
          publisher: { "@id": `${SITE}/#organization` },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${URL}#faq`,
          inLanguage: "pt-BR",
          mainEntity: FAQ_TJRJ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
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
            { "@type": "ListItem", position: 2, name: "Estados atendidos", item: `${SITE}/certidao-de-objeto-e-pe` },
            { "@type": "ListItem", position: 3, name: "Rio de Janeiro (TJRJ)", item: URL },
          ],
        }),
      },
    ],
  };
}

export function TjrjLanding() {
  const wpp = whatsappLink(
    "Olá! Preciso de uma Certidão de Objeto e Pé de um processo do TJRJ (Rio de Janeiro).",
  );
  const btn =
    "inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary";

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl surface-navy">
              <Scale className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="truncate font-display text-base font-bold">Certidão Objeto e Pé</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <main>
        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-6xl">
            <nav aria-label="Trilha" className="text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">Início</Link>
              <span className="px-2">/</span>
              <Link to="/certidao-de-objeto-e-pe" className="hover:underline">Estados</Link>
              <span className="px-2">/</span>
              <span className="font-semibold text-foreground">Rio de Janeiro (TJRJ)</span>
            </nav>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold" />
              Rio de Janeiro · TJRJ
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
              Certidão de Objeto e Pé no TJRJ (Rio de Janeiro)
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              A Certidão de Objeto e Pé de processos da Justiça Estadual do Rio de Janeiro é emitida
              pelo Tribunal de Justiça do Estado do Rio de Janeiro (TJRJ). Não somos órgão público:
              fazemos a solicitação por você, orientamos sobre os dados necessários e acompanhamos o
              pedido até a emissão, em qualquer comarca do estado.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <FileText className="h-5 w-5" />
                Solicitar Certidão do TJRJ
              </Link>
              <a
                href={wpp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold hover:bg-secondary"
              >
                <Phone className="h-4 w-4 text-gold" />
                {PHONE_DISPLAY}
              </a>
            </div>
            <AlternativasContato className="mt-4" />
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">O que é a Certidão de Objeto e Pé no TJRJ?</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                É uma certidão judicial que informa o objeto da ação, as partes e a situação atual do
                processo, esteja ele em andamento ou arquivado. Na tabela de custas do TJRJ, ela
                aparece entre as certidões emitidas pelas unidades judiciais, ao lado da certidão de
                inteiro teor. A certidão apenas descreve o processo; não o encerra nem o remove.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Quem emite?</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                O TJRJ é o órgão responsável pela emissão, por meio da unidade onde o processo tramita
                ou tramitou: o cartório da vara, no 1º grau, ou a secretaria da câmara, no 2º grau. O
                certidaodeobjetoepe.org não é órgão público e não emite certidões: prestamos o serviço
                de solicitação, orientação e acompanhamento do pedido junto ao tribunal.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Como solicitar a certidão do TJRJ</h2>
              <ol className="mt-6 space-y-5">
                {[
                  "Informe o número do processo e o nome da parte no nosso formulário.",
                  "Identificamos a comarca, a unidade judicial e o sistema em que o processo está, e geramos seu protocolo.",
                  "Fazemos o pedido à unidade do TJRJ e acompanhamos até a emissão.",
                  "A certidão emitida pelo tribunal é enviada a você em formato digital.",
                ].map((passo, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full surface-navy text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{passo}</p>
                  </li>
                ))}
              </ol>

              <h3 className="mt-10 text-lg font-bold">Quais dados são necessários?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O essencial é o número do processo e o nome da parte. Não sabe o número? Fale com a
                nossa equipe antes de pedir, para orientarmos como localizá-lo.
              </p>

              <h3 className="mt-8 text-lg font-bold">Processos eletrônicos: PJe, Portal de Serviços e eproc</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O TJRJ tem processos eletrônicos em mais de um sistema. Os mais antigos seguem no PJe e
                no Portal de Serviços. Desde 30/09/2024, o tribunal implanta o eproc de forma
                gradativa, e as novas ações das competências cíveis passaram a ser distribuídas nele.
                Por isso, verificamos em qual sistema o seu processo está antes de fazer o pedido.
              </p>

              <h3 className="mt-8 text-lg font-bold">Processos no 2º grau</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Processos em fase de recurso ficam nas câmaras do tribunal, que mantêm um serviço
                próprio de certidões do 2º grau. Também atendemos esses casos.
              </p>

              <h3 className="mt-8 text-lg font-bold">Processos físicos e arquivados</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A certidão pode se referir a processos em andamento ou arquivados. Quando o processo
                está arquivado, pode ser preciso pedir o desarquivamento, que tem custas próprias na
                tabela do TJRJ. Nesses casos, o atendimento depende da unidade judicial e pode levar
                mais tempo.
              </p>

              <h3 className="mt-8 text-lg font-bold">Segredo de justiça</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Processos em segredo de justiça têm acesso restrito. Em regra, a certidão só pode ser
                fornecida a quem tem legitimidade no processo, e a emissão depende da análise da
                unidade judicial.
              </p>

              <p className="mt-8 flex gap-2 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-gold" />
                Processos da Justiça Federal no Rio de Janeiro são do TRF2, e os trabalhistas, do TRT
                da 1ª Região. Também fazemos o pedido nesses tribunais.
              </p>
            </div>
            <aside className="h-fit rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Landmark className="h-5 w-5 text-gold" />
                Comarcas do TJRJ atendidas
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Atendemos processos da Capital, da Baixada Fluminense e do interior, incluindo:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {COMARCAS.map((cidade) => (
                  <li
                    key={cidade}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {cidade}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Prazo de emissão: 1 a 5 dias úteis, conforme a comarca e o tribunal emissor.
              </p>
              <Link
                to="/solicitar"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-accent-foreground"
              >
                <FileText className="h-4 w-4" />
                Solicitar Certidão de Objeto e Pé
              </Link>
            </aside>
          </div>
        </section>

        <section className="bg-secondary/60 px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Perguntas frequentes sobre a Certidão de Objeto e Pé no TJRJ
            </h2>
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {FAQ_TJRJ.map((item) => (
                <details key={item.q} className="group px-6 py-5">
                  <summary className="cursor-pointer list-none text-base font-semibold">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-xl font-bold">Outras páginas úteis</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              <li><Link to="/certidao-de-objeto-e-pe" className={btn}>Certidão de Objeto e Pé: guia principal</Link></li>
              <li><Link to="/certidao-objeto-e-pe-trf2" className={btn}>Justiça Federal no RJ (TRF2)</Link></li>
              <li><Link to="/blog/$slug" params={{ slug: "certidao-de-objeto-e-pe-justica-estadual" }} className={btn}>Certidão na Justiça Estadual</Link></li>
              <li><Link to="/blog/$slug" params={{ slug: "certidao-de-objeto-e-pe-pje" }} className={btn}>Certidão no PJe</Link></li>
              <li><Link to="/blog/$slug" params={{ slug: "quanto-tempo-demora-certidao-de-objeto-e-pe" }} className={btn}>Quanto tempo demora</Link></li>
              <li><Link to="/tribunais" className={btn}>Todos os tribunais atendidos</Link></li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="surface-navy px-5 py-12 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Certidão Objeto e Pé — atendimento em todo o Brasil.</p>
          <div className="flex gap-4">
            <Link to="/politica-de-privacidade" className="hover:text-primary-foreground">Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-primary-foreground">Termos</Link>
          </div>
        </div>
      </footer>

      <a
        href={wpp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar sobre certidão do TJRJ pelo WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-bold text-accent-foreground shadow-xl lg:hidden"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </a>
    </div>
  );
}
