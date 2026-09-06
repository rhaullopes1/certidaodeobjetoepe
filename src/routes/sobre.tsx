import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import {
  EMAIL_CONTATO,
  FACEBOOK_PAGE,
  INSTAGRAM_PROFILE,
  PHONE_DISPLAY,
  PHONE_TEL,
  YOUTUBE_CHANNEL,
} from "@/lib/site";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/sobre`;
const TITLE = "Sobre Nós — Certidão de Objeto e Pé em Todo o Brasil";
const DESC =
  "Quem somos: empresa especializada em solicitação de Certidão de Objeto e Pé em tribunais estaduais, federais e trabalhistas, com atendimento 100% online.";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
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
          "@type": "Organization",
          name: "Certidão de Objeto e Pé",
          url: SITE,
          logo: `${SITE}/favicon-192.png`,
          image: `${SITE}/og-certidao.jpg`,
          email: EMAIL_CONTATO,
          telephone: "+55 800 000 4604",
          areaServed: "BR",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Balneário Camboriú",
            addressRegion: "SC",
            addressCountry: "BR",
          },
          sameAs: [INSTAGRAM_PROFILE, FACEBOOK_PAGE, YOUTUBE_CHANNEL],
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer service",
              telephone: "+55 800 000 4604",
              email: EMAIL_CONTATO,
              availableLanguage: ["Portuguese"],
              areaServed: "BR",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE },
            { "@type": "ListItem", position: 2, name: "Sobre", item: URL },
          ],
        }),
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <PageShell>
      <section className="w-full px-4 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="font-display text-3xl font-bold leading-tight break-words sm:text-4xl">
            Sobre a Certidão de Objeto e Pé
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Somos uma empresa especializada na solicitação de Certidão de Objeto e Pé junto a
            tribunais estaduais, federais e trabalhistas de todo o Brasil. Cuidamos de todo o
            caminho do documento: conferência dos dados do processo, protocolo no sistema correto,
            acompanhamento até a emissão e entrega da certidão em PDF.
          </p>

          <h2 className="mt-12 font-display text-xl font-bold sm:text-2xl">Como trabalhamos</h2>
          <ul className="mt-4 space-y-2 text-base leading-relaxed text-muted-foreground">
            {[
              "Atendimento 100% online, sem necessidade de ida ao fórum.",
              "Conferência dos dados antes do protocolo, para evitar indeferimento.",
              "Protocolo no tribunal ou sistema eletrônico competente (PJe, eSAJ, Projudi e outros).",
              "Acompanhamento por número de protocolo, com status atualizado no site.",
              "Entrega da certidão em PDF por e-mail, junto do comprovante do pedido.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 font-display text-xl font-bold sm:text-2xl">Transparência</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Os valores são informados antes do pagamento e não há cobrança recorrente. Eventuais
            custas cobradas pelo próprio tribunal são comunicadas antes de qualquer cobrança
            adicional. Não somos escritório de advocacia e não prestamos consultoria jurídica: nosso
            serviço é a obtenção do documento oficial junto ao Judiciário.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Pagamentos processados por BR BROKERS, CNPJ 29.125.265/0001-06, Balneário Camboriú (SC).
          </p>

          <h2 className="mt-12 font-display text-xl font-bold sm:text-2xl">Fale com a gente</h2>
          <ul className="mt-4 space-y-2 text-base text-muted-foreground">
            <li>
              Telefone:{" "}
              <a href={PHONE_TEL} className="font-semibold text-foreground hover:underline">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              E-mail:{" "}
              <a
                href={`mailto:${EMAIL_CONTATO}`}
                className="font-semibold break-all text-foreground hover:underline"
              >
                {EMAIL_CONTATO}
              </a>
            </li>
          </ul>
          <AlternativasContato className="mt-6" />

          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Solicite sua certidão</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Informe o número do processo e receba o protocolo na hora.
            </p>
            <Link
              to="/solicitar"
              className="mt-5 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-accent-foreground"
            >
              Solicitar agora
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
