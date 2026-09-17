import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  Mail,
  MessageCircle,
  Scale,
  Search,
} from "lucide-react";
import { consultarPedido, reenviarEmailPedido } from "@/lib/pedidos.functions";
import { statusPedido, formatarBRL, whatsappLink, FLUXO_STATUS } from "@/lib/site";
import { AlternativasContato } from "@/components/site/alternativas-contato";
import { PrazoEmissao } from "@/components/site/prazo-emissao";

export const Route = createFileRoute("/acompanhar")({
  component: AcompanharPage,
  head: () => ({
    meta: [
      { title: "Acompanhar pedido pelo protocolo | Certidão de Objeto e Pé" },
      {
        name: "description",
        content:
          "Informe o número de protocolo e acompanhe o status da sua Certidão de Objeto e Pé, além de baixar o comprovante em PDF.",
      },
      {
        property: "og:title",
        content: "Acompanhar pedido pelo protocolo | Certidão de Objeto e Pé",
      },
      {
        property: "og:description",
        content:
          "Consulte o andamento do seu pedido de Certidão de Objeto e Pé com o número de protocolo.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      
    ],
    links: [{ rel: "canonical", href: "https://certidaodeobjetoepe.org/acompanhar" }],
  }),
});

type Pedido = Awaited<ReturnType<typeof consultarPedido>>;

const ETAPAS = FLUXO_STATUS.filter((s) => s !== "cancelado");

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

function AcompanharPage() {
  const buscar = useServerFn(consultarPedido);
  const reenviar = useServerFn(reenviarEmailPedido);
  const [protocolo, setProtocolo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [reenvioStatus, setReenvioStatus] = useState<string | null>(null);
  const [reenviando, setReenviando] = useState(false);

  async function reenviarPorEmail() {
    if (!pedido) return;
    setReenviando(true);
    setReenvioStatus(null);
    try {
      const { enviado } = await reenviar({
        data: { protocolo: pedido.protocolo, email: pedido.email },
      });
      setReenvioStatus(
        enviado
          ? `Link reenviado para ${pedido.email}.`
          : "Não foi possível reenviar agora. Tente novamente.",
      );
    } catch {
      setReenvioStatus("Não foi possível reenviar agora. Tente novamente.");
    } finally {
      setReenviando(false);
    }
  }

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const valor = protocolo.trim().toUpperCase();
    if (valor.length < 6) {
      setErro("Informe o número de protocolo completo (recebido após a solicitação).");
      return;
    }
    setCarregando(true);
    setErro(null);
    setPedido(null);
    try {
      const resultado = await buscar({ data: { protocolo: valor } });
      if (!resultado) {
        setErro("Nenhum pedido encontrado para este protocolo. Confira o número informado.");
      } else {
        setPedido(resultado);
      }
    } catch {
      setErro("Não foi possível consultar agora. Tente novamente em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  const info = pedido ? statusPedido(pedido.status) : null;
  const cancelado = pedido?.status === "cancelado" || pedido?.status === "expirado";
  const etapaAtual = pedido ? ETAPAS.indexOf(pedido.status as (typeof ETAPAS)[number]) : -1;
  const comprovanteLiberado = Boolean(pedido);

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
            Início
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Acompanhar pedido de Certidão de Objeto e Pé
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Digite o número de protocolo recebido após a solicitação para ver o status do
          processamento e baixar o comprovante em PDF.
        </p>

        <form onSubmit={consultar} className="card-premium mt-8 p-6 sm:p-8">
          <label htmlFor="protocolo" className="text-sm font-semibold">
            Número de protocolo
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="protocolo"
              value={protocolo}
              onChange={(e) => setProtocolo(e.target.value.toUpperCase())}
              placeholder="Ex.: COP-2026-ABC123"
              autoComplete="off"
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold tracking-wide outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={carregando}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {carregando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Consultar
            </button>
          </div>
          {erro && <p className="mt-4 text-sm font-medium text-destructive">{erro}</p>}
        </form>

        {pedido && info && (
          <section className="card-premium mt-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Protocolo
                </p>
                <p className="font-display text-2xl font-bold">{pedido.protocolo}</p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                  info.tom === "pago"
                    ? "bg-emerald-100 text-emerald-800"
                    : info.tom === "cancelado"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-accent/15 text-accent-foreground"
                }`}
              >
                {info.label}
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{info.descricao}</p>

            <PrazoEmissao className="mt-5" />

            {!cancelado && (
              <ol className="mt-8 space-y-4">
                {ETAPAS.map((etapa, i) => {
                  const concluida = etapaAtual >= 0 && i <= etapaAtual;
                  return (
                    <li key={etapa} className="flex items-start gap-3">
                      <span
                        className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                          concluida
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${concluida ? "" : "text-muted-foreground"}`}
                        >
                          {statusPedido(etapa).label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {statusPedido(etapa).descricao}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-secondary/60 p-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  Certidões
                </dt>
                <dd className="mt-1 text-sm font-semibold">{pedido.quantidade}</dd>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  Valor total
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatarBRL(pedido.valorCentavos)}
                </dd>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  Solicitado em
                </dt>
                <dd className="mt-1 text-sm font-semibold">{dataBR(pedido.criadoEm)}</dd>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  Pagamento confirmado em
                </dt>
                <dd className="mt-1 text-sm font-semibold">{dataBR(pedido.pagoEm)}</dd>
              </div>
            </dl>

            <div className="mt-8 rounded-xl border border-border/70 p-5">
              <p className="text-sm font-semibold">Comprovante em PDF</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {comprovanteLiberado
                  ? "Disponível para download com os dados de todas as certidões solicitadas."
                  : "Ficará disponível assim que o pedido for registrado."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!comprovanteLiberado}
                  onClick={async () => {
                    const { baixarComprovantePedido } = await import("@/lib/comprovante-pdf");
                    baixarComprovantePedido({
                      protocolo: pedido.protocolo,
                      numeroProcesso: pedido.numeroProcesso,
                      nomeParte: pedido.nomeParte,
                      cpf: pedido.cpf,
                      quantidade: pedido.quantidade,
                      email: pedido.email,
                      whatsapp: pedido.whatsapp,
                      valorCentavos: pedido.valorCentavos,
                      status: pedido.status,
                      criadoEm: pedido.criadoEm,
                      pagoEm: pedido.pagoEm,
                      observacoes: pedido.observacoes,
                      certidoes: pedido.certidoes,
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-input bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-accent" />
                  Baixar comprovante em PDF
                </button>
                <Link
                  to="/pedido/$protocolo"
                  params={{ protocolo: pedido.protocolo }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
                >
                  Ver pedido e pagamento
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappLink(
                    `Olá! Gostaria de acompanhar o pedido ${pedido.protocolo}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-input bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Falar no WhatsApp
                </a>
                <button
                  type="button"
                  onClick={reenviarPorEmail}
                  disabled={reenviando}
                  className="inline-flex items-center gap-2 rounded-full border border-input bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {reenviando ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  ) : (
                    <Mail className="h-4 w-4 text-accent" />
                  )}
                  Reenviar link por e-mail
                </button>
              </div>
              {reenvioStatus && (
                <p className="mt-3 text-sm font-medium text-muted-foreground">{reenvioStatus}</p>
              )}
              <AlternativasContato className="mt-4" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
