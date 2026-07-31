import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, Scale } from "lucide-react";
import { ESTADOS, PRECO_LABEL } from "@/lib/site";
import { pedidoSchema } from "@/lib/pedidos.schema";
import { criarPedido } from "@/lib/pedidos.functions";

export const Route = createFileRoute("/solicitar")({
  component: Solicitar,
  head: () => ({
    meta: [
      { title: "Solicitar Certidão de Objeto e Pé | Pedido Online e Pagamento" },
      {
        name: "description",
        content:
          "Preencha os dados do processo, gere seu protocolo e pague com Pix. Certidão de Objeto e Pé solicitada 100% online por R$ 288,00.",
      },
      { property: "og:title", content: "Solicitar Certidão de Objeto e Pé Online" },
      {
        property: "og:description",
        content:
          "Pedido online em poucos minutos: dados do processo, protocolo automático e pagamento por Pix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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

function Solicitar() {
  const navigate = useNavigate();
  const enviarPedido = useServerFn(criarPedido);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const bruto = {
      numeroProcesso: String(form.get("numeroProcesso") ?? ""),
      uf: String(form.get("uf") ?? ""),
      cidade: String(form.get("cidade") ?? ""),
      cpf: String(form.get("cpf") ?? ""),
      email: String(form.get("email") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      observacoes: String(form.get("observacoes") ?? ""),
    };
    const confirmaEmail = String(form.get("confirmaEmail") ?? "").trim().toLowerCase();

    const parsed = pedidoSchema.safeParse(bruto);
    const novosErros: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const campo = String(issue.path[0]);
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      }
    }
    if (confirmaEmail !== bruto.email.trim().toLowerCase()) {
      novosErros.confirmaEmail = "Os e-mails não conferem.";
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
    <div className="min-h-screen bg-secondary/40">
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
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
          Solicitar Certidão de Objeto e Pé
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Preencha os dados do processo. Ao concluir, você recebe o resumo do pedido, um número de
          protocolo e o Pix de <strong className="text-foreground">{PRECO_LABEL}</strong> por
          certidão para pagamento imediato.
        </p>

        <form onSubmit={handleSubmit} className="card-premium mt-10 space-y-6 p-6 sm:p-8">
          <Campo label="Número do processo" erro={erros.numeroProcesso}>
            <input
              name="numeroProcesso"
              className={inputClass}
              placeholder="0000000-00.0000.0.00.0000"
              maxLength={40}
              required
            />
          </Campo>

          <div className="grid gap-6 sm:grid-cols-[140px_1fr]">
            <Campo label="Estado (UF)" erro={erros.uf}>
              <select name="uf" className={inputClass} defaultValue="" required>
                <option value="" disabled>
                  UF
                </option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Cidade / comarca do processo" erro={erros.cidade}>
              <input
                name="cidade"
                className={inputClass}
                placeholder="Ex: Balneário Camboriú"
                maxLength={80}
                required
              />
            </Campo>
          </div>

          <Campo
            label="CPF da pessoa relacionada ao processo"
            hint="somente números"
            erro={erros.cpf}
          >
            <input
              name="cpf"
              inputMode="numeric"
              className={inputClass}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </Campo>

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

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Valor por certidão
              </p>
              <p className="font-display text-2xl font-bold">{PRECO_LABEL}</p>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Pagamento via Pix após a confirmação do pedido
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
          <p className="text-center text-xs text-muted-foreground">
            Seus dados são usados apenas para a solicitação da certidão junto ao tribunal.
          </p>
        </form>
      </main>
    </div>
  );
}