import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, Paperclip, Trash2, Download } from "lucide-react";
import { baixarComprovantePedido } from "@/lib/comprovante-pdf";
import {
  abrirAnexo,
  buscarPedidoAdmin,
  ehNovo,
  enviarAnexo,
  listarAnexos,
  listarAndamentos,
  pedidosRelacionados,
  registrarAndamento,
  removerAnexo,
  souEquipe,
} from "@/lib/admin";
import { FLUXO_STATUS, statusPedido } from "@/lib/site";
import { AdminHeader, SemPermissao } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/$protocolo")({
  component: AdminDetalhe,
  head: () => ({
    meta: [
      { title: "Detalhe do pedido | Painel Certidão Objeto e Pé" },
      {
        name: "description",
        content: "Andamento, comprovantes e situação de um pedido de certidão.",
      },
      { property: "og:title", content: "Detalhe do pedido | Painel Certidão Objeto e Pé" },
      { property: "og:description", content: "Gestão interna do pedido de certidão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{valor}</span>
    </div>
  );
}

function AdminDetalhe() {
  const { protocolo } = Route.useParams();
  const queryClient = useQueryClient();
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });

  const pedido = useQuery({
    queryKey: ["admin-pedido", protocolo],
    queryFn: () => buscarPedidoAdmin(protocolo),
    enabled: permissao.data === true,
  });
  const pedidoId = pedido.data?.id;

  const andamentos = useQuery({
    queryKey: ["admin-andamentos", pedidoId],
    queryFn: () => listarAndamentos(pedidoId!),
    enabled: !!pedidoId,
  });
  const anexos = useQuery({
    queryKey: ["admin-anexos", pedidoId],
    queryFn: () => listarAnexos(pedidoId!),
    enabled: !!pedidoId,
  });
  const relacionados = useQuery({
    queryKey: ["admin-duplicidade", pedidoId],
    queryFn: () => pedidosRelacionados(pedido.data!),
    enabled: !!pedidoId,
  });

  const [novoStatus, setNovoStatus] = useState("");
  const [observacao, setObservacao] = useState("");
  const [tipoAnexo, setTipoAnexo] = useState("comprovante");
  const [erro, setErro] = useState<string | null>(null);

  const salvarAndamento = useMutation({
    mutationFn: () =>
      registrarAndamento({
        pedidoId: pedidoId!,
        status: novoStatus || pedido.data!.status,
        observacao,
      }),
    onSuccess: () => {
      setObservacao("");
      queryClient.invalidateQueries({ queryKey: ["admin-pedido", protocolo] });
      queryClient.invalidateQueries({ queryKey: ["admin-andamentos", pedidoId] });
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
    },
    onError: (e) => setErro(e instanceof Error ? e.message : "Falha ao salvar o andamento."),
  });

  const upload = useMutation({
    mutationFn: (arquivo: File) =>
      enviarAnexo({ pedidoId: pedidoId!, protocolo, tipo: tipoAnexo, arquivo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-anexos", pedidoId] }),
    onError: (e) => setErro(e instanceof Error ? e.message : "Falha ao enviar o arquivo."),
  });

  const excluir = useMutation({
    mutationFn: (anexo: { id: string; caminho: string }) => removerAnexo(anexo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-anexos", pedidoId] }),
  });

  const campo =
    "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-ring";

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />

      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Todos os pedidos
        </Link>

        {permissao.data === false && (
          <div className="mt-8">
            <SemPermissao />
          </div>
        )}

        {(permissao.isPending || pedido.isPending) && permissao.data !== false && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando pedido...
          </p>
        )}

        {permissao.data === true && pedido.isSuccess && !pedido.data && (
          <p className="mt-8 text-sm text-muted-foreground">
            Nenhum pedido encontrado com o protocolo {protocolo}.
          </p>
        )}

        {pedido.data && (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{pedido.data.protocolo}</h1>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                {statusPedido(pedido.data.status).label}
              </span>
              {ehNovo(pedido.data.created_at) && (
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
                  Novo
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  const p = pedido.data!;
                  baixarComprovantePedido({
                    protocolo: p.protocolo,
                    numeroProcesso: p.numero_processo,
                    nomeParte: p.nome_parte,
                    cpf: p.cpf,
                    quantidade: p.quantidade ?? 1,
                    email: p.email,
                    whatsapp: p.whatsapp,
                    valorCentavos: p.valor_centavos,
                    status: p.status,
                    criadoEm: p.created_at,
                    pagoEm: p.pago_em,
                    observacoes: p.observacoes,
                    certidoes: (Array.isArray(p.certidoes) ? p.certidoes : []) as {
                      numeroProcesso: string;
                      nomeParte: string;
                      cpf: string;
                    }[],
                  });
                }}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                <Download className="h-4 w-4" />
                Baixar comprovante PDF
              </button>
            </div>

            {erro && <p className="mt-4 text-sm font-medium text-destructive">{erro}</p>}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="card-premium p-6">
                <h2 className="text-lg font-bold">Dados do pedido</h2>
                <div className="mt-4">
                  <Linha label="Processo" valor={pedido.data.numero_processo} />
                  <Linha label="Parte envolvida" valor={pedido.data.nome_parte ?? "—"} />
                  <Linha label="Certidões" valor={String(pedido.data.quantidade ?? 1)} />
                  <Linha label="CPF" valor={pedido.data.cpf} />
                  <Linha label="E-mail" valor={pedido.data.email} />
                  <Linha label="WhatsApp" valor={pedido.data.whatsapp} />
                  <Linha
                    label="Valor"
                    valor={(pedido.data.valor_centavos / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  />
                  <Linha
                    label="Criado em"
                    valor={new Date(pedido.data.created_at).toLocaleString("pt-BR")}
                  />
                  {pedido.data.pago_em && (
                    <Linha
                      label="Pago em"
                      valor={new Date(pedido.data.pago_em).toLocaleString("pt-BR")}
                    />
                  )}
                </div>
                {Array.isArray(pedido.data.certidoes) && pedido.data.certidoes.length > 1 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold">Certidões solicitadas</p>
                    {(
                      pedido.data.certidoes as {
                        numeroProcesso: string;
                        nomeParte: string;
                        cpf: string;
                      }[]
                    ).map((c, i) => (
                      <div key={i} className="rounded-xl bg-secondary px-4 py-3 text-sm">
                        <p className="font-semibold">
                          {i + 1}. {c.numeroProcesso}
                        </p>
                        <p className="text-muted-foreground">
                          {c.nomeParte} — CPF {c.cpf}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {pedido.data.observacoes && (
                  <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    {pedido.data.observacoes}
                  </p>
                )}
              </section>

              <section className="card-premium p-6">
                <h2 className="text-lg font-bold">Atualizar andamento</h2>
                <div className="mt-4 space-y-3">
                  <select
                    className={campo}
                    value={novoStatus || pedido.data.status}
                    onChange={(e) => setNovoStatus(e.target.value)}
                    aria-label="Nova situação do pedido"
                  >
                    {FLUXO_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {statusPedido(s).label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className={`${campo} min-h-24`}
                    placeholder="Observação interna (opcional)"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setErro(null);
                      salvarAndamento.mutate();
                    }}
                    disabled={salvarAndamento.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {salvarAndamento.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Registrar andamento
                  </button>
                </div>

                <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Histórico
                </h3>
                <ol className="mt-4 space-y-4">
                  {(andamentos.data ?? []).map((a) => (
                    <li key={a.id} className="border-l-2 border-accent/50 pl-4">
                      <p className="text-sm font-semibold">{statusPedido(a.status).label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString("pt-BR")}
                      </p>
                      {a.observacao && <p className="mt-1 text-sm">{a.observacao}</p>}
                    </li>
                  ))}
                  {andamentos.data?.length === 0 && (
                    <li className="text-sm text-muted-foreground">Nenhum andamento registrado.</li>
                  )}
                </ol>
              </section>
            </div>

            <section className="card-premium mt-6 p-6">
              <h2 className="text-lg font-bold">Comprovantes e documentos</h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  className={`${campo} max-w-56`}
                  value={tipoAnexo}
                  onChange={(e) => setTipoAnexo(e.target.value)}
                  aria-label="Tipo de anexo"
                >
                  <option value="comprovante">Comprovante de pagamento</option>
                  <option value="protocolo">Protocolo do tribunal</option>
                  <option value="certidao">Certidão emitida</option>
                  <option value="outro">Outro documento</option>
                </select>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-input px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary">
                  {upload.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Paperclip className="h-4 w-4 text-accent" />
                  )}
                  Anexar arquivo
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) {
                        setErro(null);
                        upload.mutate(f);
                      }
                    }}
                  />
                </label>
              </div>

              <ul className="mt-6 space-y-3">
                {(anexos.data ?? []).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{a.nome_arquivo}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.tipo} · {new Date(a.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const url = await abrirAnexo(a.caminho);
                            window.open(url, "_blank", "noopener,noreferrer");
                          } catch {
                            setErro("Não foi possível abrir o arquivo.");
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
                      >
                        <Download className="h-3.5 w-3.5" /> Abrir
                      </button>
                      <button
                        onClick={() => excluir.mutate({ id: a.id, caminho: a.caminho })}
                        aria-label={`Remover ${a.nome_arquivo}`}
                        className="inline-flex items-center rounded-full border border-input bg-background p-2 text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
                {anexos.data?.length === 0 && (
                  <li className="text-sm text-muted-foreground">Nenhum arquivo anexado ainda.</li>
                )}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}