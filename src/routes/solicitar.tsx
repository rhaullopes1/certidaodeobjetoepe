import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, Scale } from "lucide-react";
import { TABELA_PRECOS, formatarBRL, precoCentavos } from "@/lib/site";
import {
  pedidoSchema,
  etapaProcessoSchema,
  certidaoSchema,
  cpfValido,
  soDigitos,
  type EtapaProcessoInput,
} from "@/lib/pedidos.schema";
import { criarPedido } from "@/lib/pedidos.functions";

export const Route = createFileRoute("/solicitar")({
  component: Solicitar,
  head: () => ({
    meta: [
      { title: "Solicitar Certidão de Objeto e Pé | Pedido Online" },
      {
        name: "description",
        content:
          "Informe o número do processo, o nome e o CPF da parte envolvida e receba o valor da sua Certidão de Objeto e Pé para pagamento por Pix.",
      },
      { property: "og:title", content: "Solicitar Certidão de Objeto e Pé Online" },
      {
        property: "og:description",
        content:
          "Pedido online em poucos minutos: dados do processo, protocolo automático e pagamento por Pix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://certidaodeobjetoepe.org/solicitar" },
    ],
    links: [{ rel: "canonical", href: "https://certidaodeobjetoepe.org/solicitar" }],
  }),
});

const inputClass =
  "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring";

function Campo({
  label,
  hint,
  children,
  erro,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  erro?: string;
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

const QUANTIDADES = Object.keys(TABELA_PRECOS).map(Number);

function Solicitar() {
  const navigate = useNavigate();
  const enviarPedido = useServerFn(criarPedido);
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [processo, setProcesso] = useState<EtapaProcessoInput | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [extras, setExtras] = useState<EtapaProcessoInput[]>([]);

  function alterarQuantidade(q: number) {
    setQuantidade(q);
    setExtras((atual) => {
      const alvo = q - 1;
      const proximo = atual.slice(0, alvo);
      while (proximo.length < alvo) {
        proximo.push({ numeroProcesso: "", nomeParte: "", cpf: "" });
      }
      return proximo;
    });
  }

  function atualizarExtra(i: number, campo: keyof EtapaProcessoInput, valor: string) {
    setExtras((atual) => atual.map((c, idx) => (idx === i ? { ...c, [campo]: valor } : c)));
  }
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function coletarErros(issues: { path: PropertyKey[]; message: string }[]) {
    const novos: Record<string, string> = {};
    for (const issue of issues) {
      const campo = String(issue.path[0]);
      if (!novos[campo]) novos[campo] = issue.message;
    }
    return novos;
  }

  function avancar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = etapaProcessoSchema.safeParse({
      numeroProcesso: String(form.get("numeroProcesso") ?? ""),
      nomeParte: String(form.get("nomeParte") ?? ""),
      cpf: String(form.get("cpf") ?? ""),
    });
    if (!parsed.success) {
      setErros(coletarErros(parsed.error.issues));
      return;
    }
    setErros({});
    setProcesso(parsed.data);
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finalizar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!processo) return;
    const form = new FormData(e.currentTarget);
    const total = precoCentavos(quantidade);
    const listaCertidoes = [processo, ...extras];
    const bruto = {
      ...processo,
      certidoes: listaCertidoes,
      quantidade,
      valorTotalCentavos: total,
      email: String(form.get("email") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      observacoes: String(form.get("observacoes") ?? ""),
    };
    const confirmaEmail = String(form.get("confirmaEmail") ?? "").trim().toLowerCase();

    const parsed = pedidoSchema.safeParse(bruto);
    const novosErros = parsed.success ? {} : coletarErros(parsed.error.issues);
    if (confirmaEmail !== bruto.email.trim().toLowerCase()) {
      novosErros.confirmaEmail = "Os e-mails não conferem.";
    }
    extras.forEach((c, i) => {
      const r = certidaoSchema.safeParse(c);
      if (!r.success) {
        for (const issue of r.error.issues) {
          const chave = `extra-${i}-${String(issue.path[0])}`;
          if (!novosErros[chave]) novosErros[chave] = issue.message;
        }
      }
    });
    if (!QUANTIDADES.includes(quantidade) || total !== precoCentavos(quantidade)) {
      novosErros.valorTotalCentavos =
        "O valor não corresponde à quantidade selecionada. Escolha a quantidade novamente.";
    }
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      setErroGeral(null);
      return;
    }

    setErros({});
    setErroGeral(null);
    setEnviando(true);
    try {
      const pedido = await enviarPedido({ data: parsed.data! });
      navigate({ to: "/pedido/$protocolo", params: { protocolo: pedido.protocolo } });
    } catch (error) {
      console.error(error);
      setErroGeral("Não foi possível registrar seu pedido agora. Tente novamente em instantes.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-dvh bg-secondary/40">
      <header className="surface-navy">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-foreground/15">
              <Scale className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-sm font-bold">Certidão Objeto e Pé</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Etapa {etapa} de 2
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
          Solicitar Certidão de Objeto e Pé
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {etapa === 1
            ? "Informe os dados do processo e da parte envolvida. Na próxima etapa mostramos o valor da certidão."
            : "Escolha a quantidade de certidões, confira o valor e informe seus contatos para receber o documento."}
        </p>

        {etapa === 1 ? (
          <form onSubmit={avancar} className="card-premium mt-10 space-y-6 p-6 sm:p-8">
            <Campo label="Número do processo" erro={erros.numeroProcesso}>
              <input
                name="numeroProcesso"
                defaultValue={processo?.numeroProcesso}
                className={inputClass}
                placeholder="0000000-00.0000.0.00.0000"
                maxLength={40}
                required
              />
            </Campo>

            <Campo label="Nome completo da parte envolvida" erro={erros.nomeParte}>
              <input
                name="nomeParte"
                defaultValue={processo?.nomeParte}
                className={inputClass}
                placeholder="Ex: Maria Aparecida da Silva"
                maxLength={120}
                required
              />
            </Campo>

            <Campo label="CPF da parte envolvida" hint="somente números" erro={erros.cpf}>
              <input
                name="cpf"
                defaultValue={processo?.cpf}
                inputMode="numeric"
                className={inputClass}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </Campo>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Avançar
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Seus dados são usados apenas para a solicitação da certidão junto ao tribunal.
            </p>
          </form>
        ) : (
          <form onSubmit={finalizar} className="card-premium mt-10 space-y-6 p-6 sm:p-8">
            <div className="rounded-2xl bg-secondary px-5 py-4 text-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Processo</p>
              <p className="mt-1 font-semibold">{processo?.numeroProcesso}</p>
              <p className="text-muted-foreground">
                {processo?.nomeParte} — CPF {processo?.cpf}
              </p>
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className="mt-2 text-xs font-semibold text-primary underline underline-offset-4"
              >
                Editar dados do processo
              </button>
            </div>

            <div>
              <span className="text-sm font-semibold">Quantidade de certidões</span>
              <div className="mt-3 grid gap-3 sm:grid-cols-5">
                {QUANTIDADES.map((q) => {
                  const ativo = q === quantidade;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => alterarQuantidade(q)}
                      className={`rounded-2xl border px-3 py-4 text-center transition-colors ${
                        ativo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-card hover:bg-secondary"
                      }`}
                    >
                      <span className="block font-display text-lg font-bold">{q}</span>
                      <span className="mt-1 block text-xs font-semibold">
                        {formatarBRL(precoCentavos(q))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Valor total
                </p>
                <p className="font-display text-2xl font-bold">
                  {formatarBRL(precoCentavos(quantidade))}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quantidade} {quantidade === 1 ? "certidão" : "certidões"} ·{" "}
                  {formatarBRL(precoCentavos(quantidade))}
                </p>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Pagamento via Pix após a confirmação do pedido
              </p>
            </div>

            {extras.length > 0 && (
              <div className="space-y-5">
                <p className="text-sm font-semibold">
                  Dados das demais certidões
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    cada certidão exige processo, nome e CPF próprios
                  </span>
                </p>
                {extras.map((c, i) => (
                  <div key={i} className="space-y-4 rounded-2xl border border-input bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Certidão {i + 2}
                    </p>
                    <Campo label="Número do processo" erro={erros[`extra-${i}-numeroProcesso`]}>
                      <input
                        value={c.numeroProcesso}
                        onChange={(e) => atualizarExtra(i, "numeroProcesso", e.target.value)}
                        className={inputClass}
                        placeholder="0000000-00.0000.0.00.0000"
                        maxLength={40}
                        required
                      />
                    </Campo>
                    <Campo
                      label="Nome completo da parte envolvida"
                      erro={erros[`extra-${i}-nomeParte`]}
                    >
                      <input
                        value={c.nomeParte}
                        onChange={(e) => atualizarExtra(i, "nomeParte", e.target.value)}
                        className={inputClass}
                        placeholder="Ex: Maria Aparecida da Silva"
                        maxLength={120}
                        required
                      />
                    </Campo>
                    <Campo label="CPF da parte envolvida" hint="somente números" erro={erros[`extra-${i}-cpf`]}>
                      <input
                        value={c.cpf}
                        onChange={(e) => atualizarExtra(i, "cpf", e.target.value)}
                        inputMode="numeric"
                        className={inputClass}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </Campo>
                  </div>
                ))}
              </div>
            )}

            {erros.valorTotalCentavos && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {erros.valorTotalCentavos}
              </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <Campo label="E-mail" erro={erros.email}>
                <input
                  name="email"
                  type="email"
                  className={inputClass}
                  placeholder="seu@email.com"
                  maxLength={255}
                  required
                />
              </Campo>
              <Campo label="Confirme o e-mail" erro={erros.confirmaEmail}>
                <input
                  name="confirmaEmail"
                  type="email"
                  className={inputClass}
                  placeholder="repita o e-mail"
                  maxLength={255}
                  onPaste={(e) => e.preventDefault()}
                  required
                />
              </Campo>
            </div>

            <Campo label="WhatsApp" hint="com DDD" erro={erros.whatsapp}>
              <input
                name="whatsapp"
                inputMode="tel"
                className={inputClass}
                placeholder="(47) 90000-0000"
                maxLength={20}
                required
              />
            </Campo>

            <Campo label="Observações" hint="opcional" erro={erros.observacoes}>
              <textarea
                name="observacoes"
                rows={3}
                maxLength={1000}
                className={inputClass}
                placeholder="Vara, comarca, nome das partes ou qualquer detalhe que ajude na localização."
              />
            </Campo>

            {erroGeral && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {erroGeral}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {enviando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando protocolo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Gerar pedido e pagar com Pix
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
