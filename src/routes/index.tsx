import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ShieldCheck,
  FileText,
  Landmark,
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Truck,
  Building2,
  Scale,
  User,
  Send,
  ChevronDown,
  Phone,
} from "lucide-react";
import heroImage from "@/assets/hero-certidao.jpg";
import logoAsset from "@/assets/logo-certidao.png.asset.json";
import { whatsappLink, ESTADOS, FAQ, PHONE_DISPLAY, PHONE_TEL, YOUTUBE_CHANNEL, INSTAGRAM_PROFILE, FACEBOOK_PAGE } from "@/lib/site";
import { UserMenu } from "@/components/user-menu";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Certidão de Objeto e Pé Online | Solicitação em Todo Brasil" },
      {
        name: "description",
        content:
          "Solicite sua Certidão de Objeto e Pé online. Nossa equipe auxilia na solicitação junto aos tribunais brasileiros e acompanha até a emissão.",
      },
      {
        property: "og:title",
        content: "Certidão de Objeto e Pé Online | Solicitação em Todo Brasil",
      },
      {
        property: "og:description",
        content:
          "Emita sua certidão judicial sem burocracia. Atendimento nacional, suporte por WhatsApp e acompanhamento até a conclusão.",
      },
      { property: "og:url", content: "https://certidaodeobjetoepe.org/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://certidaodeobjetoepe.org/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
});

const WPP_MAIN = whatsappLink(
  "Olá! Gostaria de solicitar uma Certidão de Objeto e Pé.",
);
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:px-8 lg:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="gold-rule inline-block" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main>
        <Hero />
        <OQueE />
        <ParaQuem />
        <ComoFunciona />
        <Diferenciais />
        <Urgencia />
        <Formulario />
        <Faq />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
        <a href="#topo" className="flex min-w-0 items-center gap-3">
          <img
            src={logoAsset.url}
            alt="Logo Certidão de Objeto e Pé"
            className="h-10 w-10 shrink-0 rounded-xl object-contain"
            width={40}
            height={40}
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold leading-tight">
              Certidão Objeto e Pé
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Atendimento nacional
            </span>
          </span>
        </a>
        <nav className="flex items-center gap-6">
          <a
            href={PHONE_TEL}
            className="hidden items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            <Phone className="h-4 w-4 text-accent" />
            {PHONE_DISPLAY}
          </a>
          <a
            href="#como-funciona"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:block"
          >
            Como funciona
          </a>
          <a
            href="#faq"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:block"
          >
            Dúvidas
          </a>
          <Link
            to="/solicitar"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Solicitar online</span>
            <span className="sm:hidden">Solicitar</span>
          </Link>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

const heroTrust = [
  { icon: MapPin, label: "Atendimento nacional" },
  { icon: CheckCircle2, label: "Processo simples" },
  { icon: MessageCircle, label: "Acompanhamento personalizado" },
  { icon: FileText, label: "Receba sua certidão digital" },
];

function Hero() {
  return (
    <div id="topo" className="surface-navy relative overflow-hidden">
      <Section className="!py-16 lg:!py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gold-soft">
              <ShieldCheck className="h-3.5 w-3.5" />
              Documentos judiciais digitais
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              Solicite sua Certidão de Objeto e Pé Online em Todo Brasil
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              Não sabe onde solicitar ou como acompanhar? Nossa equipe realiza o
              pedido junto ao tribunal responsável e acompanha até a emissão do
              documento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <FileText className="h-4.5 w-4.5" />
                Solicitar online
              </Link>
              <a
                href={WPP_MAIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/25 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Tirar dúvidas no WhatsApp
              </a>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {heroTrust.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-sm text-primary-foreground/80"
                >
                  <Icon className="h-4.5 w-4.5 shrink-0 text-gold" strokeWidth={1.8} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              width={1280}
              height={1024}
              alt="Certidão judicial oficial com selo dourado emitida digitalmente"
              className="w-full rounded-3xl border border-primary-foreground/10 shadow-2xl"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

const oQueECards = [
  {
    icon: FileText,
    title: "Explica o processo",
    text: "Mostra qual é o assunto discutido, quem são as partes e a natureza da ação.",
  },
  {
    icon: Clock,
    title: "Mostra a situação atual",
    text: "Informa em que fase o processo se encontra na data da emissão da certidão.",
  },
  {
    icon: Landmark,
    title: "Documento oficial do tribunal",
    text: "Emitido pelo Poder Judiciário, com validade para apresentação a empresas e órgãos.",
  },
];

function OQueE() {
  return (
    <Section id="o-que-e">
      <div className="max-w-3xl">
        <Eyebrow>Entenda o documento</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">
          O que é Certidão de Objeto e Pé?
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          A Certidão de Objeto e Pé é um documento oficial emitido pelo Poder
          Judiciário que apresenta um resumo do processo, informando o assunto
          discutido e a situação atual.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {oQueECards.map(({ icon: Icon, title, text }) => (
          <article key={title} className="card-premium p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

const publicos = [
  {
    icon: User,
    title: "Pessoa física",
    text: "Precisa explicar um processo encontrado em seu nome?",
  },
  {
    icon: Truck,
    title: "Motoristas",
    text: "Precisa apresentar documentação para empresas, seguradoras ou transportadoras?",
  },
  {
    icon: Building2,
    title: "Empresas",
    text: "Precisa analisar documentos de candidatos ou parceiros?",
  },
  {
    icon: Scale,
    title: "Advogados",
    text: "Precisa agilizar solicitações para clientes?",
  },
];

function ParaQuem() {
  return (
    <Section className="bg-secondary/60">
      <div className="max-w-3xl">
        <Eyebrow>Público atendido</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Para quem é esse serviço?</h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {publicos.map(({ icon: Icon, title, text }) => (
          <article key={title} className="card-premium p-7">
            <Icon className="h-6 w-6 text-accent" strokeWidth={1.7} />
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

const etapas = [
  {
    title: "Envie os dados do processo",
    text: "Pelo WhatsApp ou formulário, com o número do processo ou os dados da parte.",
  },
  {
    title: "Identificamos o tribunal responsável",
    text: "Nossa equipe localiza a vara, comarca e o tribunal competente pelo pedido.",
  },
  {
    title: "Solicitamos a certidão",
    text: "Protocolamos o pedido junto ao tribunal e acompanhamos o andamento diariamente.",
  },
  {
    title: "Você recebe o documento digital",
    text: "A certidão é enviada em PDF pelo WhatsApp ou e-mail, pronta para apresentação.",
  },
];

function ComoFunciona() {
  return (
    <Section id="como-funciona">
      <div className="max-w-3xl">
        <Eyebrow>Passo a passo</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Como funciona</h2>
      </div>
      <ol className="relative mt-12 space-y-8 border-l border-border pl-8 sm:pl-10">
        {etapas.map((etapa, i) => (
          <li key={etapa.title} className="relative">
            <span className="absolute -left-[3.15rem] grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground sm:-left-[3.65rem]">
              {i + 1}
            </span>
            <h3 className="text-lg font-bold">{etapa.title}</h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {etapa.text}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const diferenciais = [
  { icon: MapPin, title: "Atendimento em todo Brasil", text: "Tribunais estaduais, federais e trabalhistas de qualquer estado." },
  { icon: MessageCircle, title: "Suporte via WhatsApp", text: "Fale com uma pessoa real durante todo o processo, sem robôs." },
  { icon: CheckCircle2, title: "Processo simplificado", text: "Você envia os dados uma única vez e nós cuidamos da burocracia." },
  { icon: ShieldCheck, title: "Acompanhamento até a conclusão", text: "Monitoramos o pedido no tribunal até a certidão ser emitida." },
  { icon: Clock, title: "Economia de tempo", text: "Sem filas, sem deslocamento e sem tentar descobrir qual vara procurar." },
];

function Diferenciais() {
  return (
    <Section className="bg-secondary/60">
      <div className="max-w-3xl">
        <Eyebrow>Diferenciais</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Por que solicitar conosco?</h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {diferenciais.map(({ icon: Icon, title, text }) => (
          <article key={title} className="card-premium p-7">
            <Icon className="h-6 w-6 text-primary" strokeWidth={1.7} />
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Urgencia() {
  return (
    <Section className="surface-navy">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Precisa apresentar essa documentação rapidamente?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/75">
          Evite perder tempo tentando descobrir qual tribunal procurar. Nossa
          equipe auxilia em todas as etapas.
        </p>
        <Link
          to="/solicitar"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <FileText className="h-4.5 w-4.5" />
          Solicitar agora
        </Link>
      </div>
    </Section>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring";

function Formulario() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome") ?? "").trim().slice(0, 100);
    const whats = String(form.get("whatsapp") ?? "").trim().slice(0, 20);
    const email = String(form.get("email") ?? "").trim().slice(0, 255);
    const processo = String(form.get("processo") ?? "").trim().slice(0, 60);
    const estado = String(form.get("estado") ?? "").trim().slice(0, 2);
    const obs = String(form.get("observacoes") ?? "").trim().slice(0, 1000);

    if (nome.length < 3 || whats.length < 8) {
      setError("Informe seu nome completo e um WhatsApp válido.");
      return;
    }
    setError(null);
    setSent(true);

    const msg = [
      "Olá! Quero solicitar uma Certidão de Objeto e Pé.",
      `Nome: ${nome}`,
      `WhatsApp: ${whats}`,
      email && `E-mail: ${email}`,
      processo && `Processo: ${processo}`,
      estado && `Estado: ${estado}`,
      obs && `Observações: ${obs}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
  }

  return (
    <Section id="solicitar">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>Solicitação</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Solicite online e pague com Pix
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Faça todo o pedido pelo site: informe o processo, gere o número de
            protocolo e o valor da certidão, e pague via Pix (QR Code ou copia e
            cola). Prefere falar antes? Use o formulário ao lado e nossa
            equipe te atende pelo WhatsApp.
          </p>
          <Link
            to="/solicitar"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            Iniciar solicitação online
          </Link>
          <div className="mt-8 space-y-3">
            {["Retorno rápido no horário comercial", "Orçamento antes de qualquer pagamento", "Dados tratados com sigilo"].map(
              (item) => (
                <p key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-accent" strokeWidth={1.8} />
                  {item}
                </p>
              ),
            )}
          </div>
          <a
            href={PHONE_TEL}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <Phone className="h-4 w-4 text-accent" />
            {PHONE_DISPLAY}
          </a>
        </div>

        <div className="card-premium p-6 sm:p-8">
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-accent" strokeWidth={1.6} />
              <h3 className="mt-5 text-xl font-bold">Solicitação enviada!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Estamos te direcionando para o WhatsApp para concluir o
                atendimento. Se a janela não abrir, use o botão abaixo.
              </p>
              <a
                href={WPP_MAIN}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                Abrir WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium sm:col-span-2">
                  Nome completo
                  <input name="nome" maxLength={100} required className={inputClass} placeholder="Seu nome" />
                </label>
                <label className="block text-sm font-medium">
                  WhatsApp
                  <input name="whatsapp" maxLength={20} required inputMode="tel" className={inputClass} placeholder="(00) 00000-0000" />
                </label>
                <label className="block text-sm font-medium">
                  E-mail
                  <input name="email" type="email" maxLength={255} className={inputClass} placeholder="voce@email.com" />
                </label>
                <label className="block text-sm font-medium">
                  Número do processo
                  <input name="processo" maxLength={60} className={inputClass} placeholder="Opcional" />
                </label>
                <label className="block text-sm font-medium">
                  Estado
                  <select name="estado" defaultValue="" className={inputClass}>
                    <option value="">Selecione</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium sm:col-span-2">
                  Observações
                  <textarea name="observacoes" maxLength={1000} rows={4} className={inputClass} placeholder="Conte brevemente sua necessidade" />
                </label>
              </div>
              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                Enviar solicitação
              </button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

function Faq() {
  return (
    <Section id="faq" className="bg-secondary/60">
      <div className="max-w-3xl">
        <Eyebrow>Dúvidas frequentes</Eyebrow>
        <h2 className="text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
      </div>
      <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {FAQ.map((item) => (
          <details key={item.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
              {item.q}
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="surface-navy px-5 py-14 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt="Logo Certidão de Objeto e Pé"
              className="h-10 w-10 shrink-0 rounded-xl border border-gold/40 object-contain"
              width={40}
              height={40}
              loading="lazy"
            />
            <span className="font-display font-bold">Certidão Objeto e Pé</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            Assessoria especializada em solicitação de certidões judiciais em
            todo o Brasil.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-soft">
            Navegação
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/70">
            <li><a href="#o-que-e" className="hover:text-primary-foreground">O que é</a></li>
            <li><a href="#como-funciona" className="hover:text-primary-foreground">Como funciona</a></li>
            <li><Link to="/solicitar" className="hover:text-primary-foreground">Solicitar certidão</Link></li>
            <li><Link to="/certidao-de-objeto-e-pe" className="hover:text-primary-foreground">Certidão por estado</Link></li>
            <li><Link to="/certidao-objeto-e-pe-tjsp" className="hover:text-primary-foreground">Certidão de Objeto e Pé TJSP</Link></li>
            <li><Link to="/tribunais" className="hover:text-primary-foreground">Todos os tribunais</Link></li>
            <li><Link to="/blog" className="hover:text-primary-foreground">Blog</Link></li>

            <li><a href="#faq" className="hover:text-primary-foreground">Perguntas frequentes</a></li>

          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-soft">
            Institucional
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/70">
            <li><Link to="/politica-de-privacidade" className="hover:text-primary-foreground">Política de privacidade</Link></li>
            <li><Link to="/termos-de-uso" className="hover:text-primary-foreground">Termos de uso</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-soft">
            Contato
          </h3>
          <a
            href={PHONE_TEL}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary-foreground/85 hover:text-primary-foreground"
          >
            <Phone className="h-4 w-4 text-gold" />
            {PHONE_DISPLAY}
          </a>
          <a
            href={WPP_MAIN}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary-foreground/85 hover:text-primary-foreground"
            aria-label="Canal do YouTube Certidão de Objeto e Pé"
          >
            <svg
              className="h-5 w-5 text-gold"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.81zM9.55 15.5V8.5l6.27 3.5-6.27 3.5z" />
            </svg>
            YouTube
          </a>
          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary-foreground/85 hover:text-primary-foreground"
            aria-label="Instagram Certidão de Objeto e Pé"
          >
            <svg
              className="h-5 w-5 text-gold"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.25-.15-4.77-1.69-4.92-4.92-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 3.6.21.21 3.6.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.21 3.45 3.59 6.83 7.05 7.05 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c3.45-.21 6.83-3.59 7.05-7.05.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C22.73 3.6 19.4.21 15.95.07 14.67.01 14.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
            </svg>
            Instagram
          </a>
          <a
            href={FACEBOOK_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary-foreground/85 hover:text-primary-foreground"
            aria-label="Facebook Certidão de Objeto e Pé"
          >
            <svg
              className="h-5 w-5 text-gold"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
            </svg>
            Facebook
          </a>
        </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-primary-foreground/15 pt-6 text-xs leading-relaxed text-primary-foreground/55">
        <p>
          Serviço de assessoria administrativa para obtenção de documentos junto
          aos tribunais. Não prestamos consultoria jurídica nem representação
          processual.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Certidão Objeto e Pé. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={WPP_MAIN}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Solicitar certidão pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-bold text-accent-foreground shadow-xl transition-transform hover:-translate-y-0.5 lg:hidden"
    >
      <MessageCircle className="h-5 w-5" />
      Solicitar no WhatsApp
    </a>
  );
}
