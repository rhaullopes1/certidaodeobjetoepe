import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { soDigitos } from "@/lib/pedidos.schema";
import { antecedentesSchema, UFS } from "@/lib/antecedentes.schema";
import { criarPedidoAntecedentes } from "@/lib/antecedentes.functions";
import { trackBeginCheckout } from "@/lib/analytics";

export const Route = createFileRoute("/solicitar-antecedentes")({
  component: SolicitarAntecedentes,
  head: () => ({
    meta: [
      { title: "Consulta gratuita de Antecedentes Criminais Federal | Resultado por e-mail" },
      {
        name: "description",
        content:
          "Consulta gratuita de antecedentes criminais federal. Preencha seus dados e receba o resultado da Polícia Federal por e-mail automaticamente, assim que estiver disponível.",
      },
      {
        property: "og:title",
        content: "Consulta gratuita de Antecedentes Criminais Federal",
      },
      {
        property: "og:description",
        content:
          "Consulta gratuita: emissão pelos sistemas da Polícia Federal e resultado enviado por e-mail automaticamente, assim que estiver disponível.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:url",
        content: "https://certidaodeobjetoepe.org/solicitar-antecedentes",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://certidaodeobjetoepe.org/solicitar-antecedentes",
      },
    ],
  }),
});

const inputClass =
  "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring";

function Campo({
  label,
  hint,
  erro,
  children,
}: {
  label: string;
  hint?: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="ml-2 text-xs text-muted-foreground">{hint}</span>}
      {children}
      {erro && <span className="mt-1 block text-xs font-medium text-destructive">{erro}</span>}
    </label>
  );
}

const mascararCpf = (v: string) => {
  const d = soDigitos(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
};

const mascararTelefone = (v: string) => {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};

function SolicitarAntecedentes() {
  const [enviado, setEnviado] = useState<{ protocolo: string; email: string } | null>(null);
  const enviar = useServerFn(criarPedidoAntecedentes);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [nomePai, setNomePai] = useState("");
  const [ufNascimento, setUfNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErroGeral("");

    const bruto = {
      nome: nome.trim(),
      cpf: soDigitos(cpf),
      nascimento,
      nomeMae: nomeMae.trim(),
      nomePai: nomePai.trim(),
      ufNascimento,
      email: email.trim().toLowerCase(),
      whatsapp: soDigitos(whatsapp),
      valorTotalCentavos: 0,
    };

    const parsed = antecedentesSchema.safeParse(bruto);
    if (!parsed.success) {
      const mapa: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const campo = String(issue.path[0]);
        if (!mapa[campo]) mapa[campo] = issue.message;
      }
      setErros(mapa);
      setErroGeral("Confira os dados destacados antes de enviar.");
      return;
    }

    setErros({});
    setEnviando(true);
    trackBeginCheckout();
    try {
      const pedido = await enviar({ data: parsed.data });
      setEnviado({ protocolo: pedido.protocolo, email: pedido.email });
      setEnviando(false);
    } catch (error) {
      console.error(error);
      setErroGeral("Não foi possível registrar seu pedido agora. Tente novamente em instantes.");
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="min-h-dvh bg-secondary/40">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
            <CheckCircle2 className="mx-auto size-10 text-live" aria-hidden />
            <h1 className="mt-3 font-display text-2xl font-extrabold">Consulta registrada</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Seu resultado será enviado automaticamente por e-mail para{" "}
              <strong className="text-foreground">{enviado.email}</strong>, assim que a Polícia
              Federal disponibilizar a certidão. Confira também a caixa de spam.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">Protocolo: {enviado.protocolo}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-secondary/40">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Polícia Federal · SINIC
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
          Consulta gratuita de antecedentes criminais federal
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Preencha os dados exatamente como constam no seu documento de identidade. A consulta é
          gratuita e o seu resultado será enviado por e-mail automaticamente, assim que estiver disponível.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Dados da pessoa</h2>

            <div className="mt-4 space-y-4">
              <Campo label="Nome completo" erro={erros["nome"]}>
                <input
                  className={inputClass}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como consta no documento"
                  autoComplete="name"
                />
              </Campo>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="CPF" erro={erros["cpf"]}>
                  <input
                    className={inputClass}
                    value={cpf}
                    onChange={(e) => setCpf(mascararCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                  />
                </Campo>

                <Campo label="Data de nascimento" erro={erros["nascimento"]}>
                  <input
                    type="date"
                    className={inputClass}
                    value={nascimento}
                    onChange={(e) => setNascimento(e.target.value)}
                  />
                </Campo>
              </div>

              <Campo
                label="Nome da mãe"
                hint="opcional, ajuda a localizar o registro"
                erro={erros["nomeMae"]}
              >
                <input
                  className={inputClass}
                  value={nomeMae}
                  onChange={(e) => setNomeMae(e.target.value)}
                  placeholder="Nome completo da mãe"
                />
              </Campo>

              <Campo label="Nome do pai" hint="opcional" erro={erros["nomePai"]}>
                <input
                  className={inputClass}
                  value={nomePai}
                  onChange={(e) => setNomePai(e.target.value)}
                  placeholder="Nome completo do pai"
                />
              </Campo>

              <Campo label="Estado de nascimento" erro={erros["ufNascimento"]}>
                <select
                  className={inputClass}
                  value={ufNascimento}
                  onChange={(e) => setUfNascimento(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Para onde enviamos o resultado</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo label="E-mail" erro={erros["email"]}>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </Campo>
              <Campo label="WhatsApp" erro={erros["whatsapp"]}>
                <input
                  className={inputClass}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(mascararTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Campo>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Resumo do pedido</h2>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Certidão de Antecedentes Criminais Federal
              </span>
              <span className="font-display text-xl font-extrabold">Gratuita</span>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
              Sem pagamento. Seu resultado será enviado por e-mail automaticamente, assim que estiver disponível.
            </p>
          </div>

          {erroGeral && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {erroGeral}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {enviando ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {enviando ? "Registrando sua consulta..." : "Fazer consulta gratuita"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Precisa da Certidão de Objeto e Pé de um processo?{" "}
            <Link to="/solicitar" className="font-semibold underline">
              Solicitar aqui
            </Link>
            .
          </p>
        </form>
      </main>
    </div>
  );
}
