import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { AlternativasContato } from "@/components/site/alternativas-contato";

const SITE = "https://certidaodeobjetoepe.org";
const URL = `${SITE}/certidao-de-antecedentes-criminais`;

const TITULO =
  "Certidão de Antecedentes Criminais Federal e Estadual | Solicite na Hora";
const DESCRICAO =
  "Combo de Certidão de Antecedentes Criminais Federal e Estadual em um único pedido online. Processo automatizado, acompanhamento por protocolo e entrega em PDF por e-mail.";

const COMBO = [
  {
    titulo: "Antecedentes Criminais Federal",
    orgao: "Justiça Federal / Polícia Federal",
    texto:
      "Abrange todo o território nacional e é a certidão normalmente exigida por órgãos federais, processos de naturalização, vistos e cadastros de abrangência nacional.",
    itens: [
      "Validade em todo o Brasil",
      "Documento oficial com código de autenticação",
      "Exigida com frequência em concursos e processos federais",
    ],
  },
  {
    titulo: "Antecedentes Criminais Estadual",
    orgao: "Secretaria de Segurança Pública / Polícia Civil do estado",
    texto:
      "Emitida pelo estado indicado por você — normalmente o estado do RG ou da residência. É a certidão mais pedida em admissões CLT, cadastros profissionais e exigências de órgãos estaduais.",
    itens: [
      "Emitida pelo órgão do estado que você escolher",
      "Formato aceito pelos setores de RH e departamento pessoal",
      "Pode ser pedida junto com a federal no mesmo protocolo",
    ],
  },
];

const DIFERENCIAIS = [
  {
    titulo: "Pedido em poucos minutos",
    texto:
      "Formulário curto: nome completo, CPF e estado. Sem fila, sem deslocamento e sem precisar entender o sistema de cada órgão.",
  },
  {
    titulo: "Processo automatizado",
    texto:
      "Assim que o pagamento é confirmado, o pedido entra automaticamente na fila de emissão e você recebe um número de protocolo para acompanhar.",
  },
  {
    titulo: "Documentos oficiais e verificáveis",
    texto:
      "As certidões são as próprias certidões emitidas pelos órgãos competentes, com código ou chave de autenticação para conferência no site oficial.",
  },
  {
    titulo: "Seus dados protegidos",
    texto:
      "Tratamos os dados pessoais apenas para a finalidade do pedido, em conexão segura e conforme a Lei Geral de Proteção de Dados.",
  },
];

const PASSOS = [
  {
    n: "1",
    titulo: "Preencha o pedido",
    texto: "Informe nome completo, CPF e o estado da certidão estadual. Leva menos de três minutos.",
  },
  {
    n: "2",
    titulo: "Pague com Pix ou cartão",
    texto:
      "O valor aparece no resumo antes do pagamento, com desconto progressivo quando você pede mais de uma certidão. O Pix é confirmado automaticamente.",
  },
  {
    n: "3",
    titulo: "Receba em PDF",
    texto:
      "As certidões chegam por e-mail em PDF e ficam disponíveis na página de acompanhamento pelo seu protocolo.",
  },
];

const FAQ = [
  {
    q: "Qual a diferença entre a certidão estadual e a federal?",
    a: "A estadual é emitida pelo órgão de segurança pública do estado e considera registros daquele estado. A federal abrange o território nacional e é emitida no âmbito da Justiça Federal e da Polícia Federal. Muitos órgãos e empresas pedem as duas, por isso o combo.",
  },
  {
    q: "Quanto tempo leva para eu receber?",
    a: "O pedido é registrado na hora e segue para emissão logo após a confirmação do pagamento. O tempo de emissão depende do órgão emissor de cada certidão; você acompanha cada etapa pelo protocolo.",
  },
  {
    q: "A certidão serve para empresa, concurso e processo seletivo?",
    a: "Sim. São as certidões oficiais emitidas pelos próprios órgãos, com código de autenticação. Confira sempre no edital ou com a empresa qual das duas (ou se ambas) está sendo exigida.",
  },
  {
    q: "Como a empresa confere se o documento é verdadeiro?",
    a: "Cada certidão traz um código ou chave de autenticação que pode ser conferido no site do órgão emissor. O documento é o mesmo que você obteria indo até o órgão.",
  },
  {
    q: "O que acontece se constar alguma anotação?",
    a: "A certidão apenas reproduz o que consta nos registros oficiais na data da emissão. Nós não alteramos, removemos nem interferimos em nenhum registro ou processo.",
  },
  {
    q: "Posso pedir apenas uma das duas certidões?",
    a: "Pode. O combo federal + estadual é a opção mais procurada, mas você escolhe no pedido se quer as duas ou apenas uma.",
  },
];

export const Route = createFileRoute("/certidao-de-antecedentes-criminais")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITULO },
      { name: "twitter:description", content: DESCRICAO },
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
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE },
            {
              "@type": "ListItem",
              position: 2,
              name: "Certidão de Antecedentes Criminais",
              item: URL,
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: AntecedentesPage,
});

function CtaPrincipal({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/solicitar"
      className={`inline-flex items-center justify-center rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-accent-foreground shadow-lg transition-transform hover:scale-[1.02] ${className}`}
    >
      Solicitar certidão agora
    </Link>
  );
}

function AntecedentesPage() {
  return (
    <PageShell>
      <article className="w-full">
        {/* Hero */}
        <section className="border-b border-border bg-navy-deep text-background">
          <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-8 lg:py-20">
            <nav aria-label="Trilha de navegação" className="text-xs opacity-70">
              <Link to="/" className="hover:opacity-100">
                Início
              </Link>
              <span className="px-2">/</span>
              <span>Antecedentes Criminais</span>
            </nav>

            <p className="mt-6 inline-flex rounded-full border border-gold/50 px-4 py-1.5 text-[11px] font-bold tracking-wide text-gold uppercase">
              Combo Federal + Estadual
            </p>

            <h1 className="mt-5 font-display text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              Certidão de Antecedentes Criminais Federal e Estadual, pedida na hora
            </h1>

            <p className="mt-5 text-base leading-relaxed opacity-85">
              Precisa comprovar antecedentes para uma admissão, posse em concurso, cadastro
              profissional ou viagem? Faça o pedido online em poucos minutos: o processo é
              automatizado e você acompanha tudo pelo seu número de protocolo até receber as
              certidões em PDF.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaPrincipal />
              <span className="text-xs opacity-70">
                Pedido 100% online • Pix confirmado automaticamente
              </span>
            </div>

            <ul className="mt-9 grid gap-3 text-sm sm:grid-cols-3">
              {["Pedido em minutos", "Processo automatizado", "Documentos oficiais"].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 rounded-xl border border-background/15 bg-background/5 px-4 py-3 font-semibold"
                >
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-8 lg:py-20">
          {/* Combo */}
          <section>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              O que vem no combo de antecedentes criminais
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              A maioria das exigências pede as duas certidões. Em vez de navegar por portais
              diferentes, você faz um único pedido e recebe tudo no mesmo e-mail.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {COMBO.map((c) => (
                <div key={c.titulo} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-bold break-words">{c.titulo}</h3>
                  <p className="mt-1 text-xs font-semibold tracking-wide text-gold uppercase">
                    {c.orgao}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.texto}</p>
                  <ul className="mt-4 space-y-2">
                    {c.itens.map((i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span className="break-words">{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Diferenciais */}
          <section className="mt-14">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Por que solicitar com a gente
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {DIFERENCIAIS.map((d) => (
                <div key={d.titulo} className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-semibold break-words">{d.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.texto}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Passo a passo */}
          <section className="mt-14">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Como funciona</h2>
            <ol className="mt-6 space-y-4">
              {PASSOS.map((p) => (
                <li
                  key={p.n}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-accent-foreground">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-semibold break-words">{p.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* CTA intermediário */}
          <section className="mt-14 rounded-3xl border border-gold/40 bg-secondary p-7 text-center">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Comece agora o seu pedido
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Preencha os dados, escolha entre o combo federal + estadual ou apenas uma certidão e
              acompanhe pelo protocolo. O valor aparece no resumo antes do pagamento.
            </p>
            <CtaPrincipal className="mt-6" />
            <AlternativasContato className="mt-5 justify-center" />
          </section>

          {/* Transparência */}
          <section className="mt-14">
            <h2 className="font-display text-xl font-bold sm:text-2xl">O que você precisa saber</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Atuamos como empresa de preparação e intermediação de documentos: cuidamos do pedido
              junto aos órgãos competentes e entregamos as certidões oficiais a você. Não somos
              órgão público e não temos qualquer influência sobre o conteúdo das certidões.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A certidão apenas reflete o que consta nos registros oficiais na data da emissão. Ela
              não altera, não cancela e não remove nenhum registro ou processo. Se o seu caso
              envolve um processo específico e você precisa comprovar do que ele trata e em que fase
              está, o documento indicado é a{" "}
              <Link
                to="/certidao-de-objeto-e-pe"
                className="underline decoration-accent/50 underline-offset-4 hover:text-foreground"
              >
                Certidão de Objeto e Pé
              </Link>
              .
            </p>
          </section>

          {/* FAQ */}
          <section className="mt-14">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Perguntas frequentes</h2>
            <dl className="mt-6 space-y-5">
              {FAQ.map((f) => (
                <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
                  <dt className="font-semibold break-words">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* CTA final */}
          <section className="mt-14 text-center">
            <h2 className="font-display text-2xl font-bold">
              Solicite suas certidões de antecedentes agora
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Pedido online, processo automatizado e acompanhamento por protocolo do início à
              entrega.
            </p>
            <CtaPrincipal className="mt-6" />
          </section>
        </div>
      </article>
    </PageShell>
  );
}
