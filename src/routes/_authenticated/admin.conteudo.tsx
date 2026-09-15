import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Play, RefreshCw, Sparkles, Trash2, CheckCircle2, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader, SemPermissao } from "./admin.index";
import { souEquipe } from "@/lib/admin";
import {
  agendarItemFn,
  alternarTemaFn,
  aprovarItemFn,
  excluirItemFn,
  executarCicloFn,
  gerarConteudoFn,
  listarTemasFn,
  painelConteudoFn,
  processarFilaFn,
  reprocessarJobFn,
  salvarAgendaFn,
} from "@/lib/conteudo.functions";
import { CANAIS, NICHOS, rotuloStatus, type Agenda } from "@/lib/conteudo/tipos";

export const Route = createFileRoute("/_authenticated/admin/conteudo")({
  component: PainelConteudo,
  head: () => ({
    meta: [
      { title: "Central de Conteúdo | Certidão Objeto e Pé" },
      { name: "description", content: "Calendário editorial, geração e fila de publicação." },
      { property: "og:title", content: "Central de Conteúdo" },
      { property: "og:description", content: "Área interna de conteúdo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ABAS = [
  { id: "dashboard", nome: "Visão geral" },
  { id: "conteudos", nome: "Conteúdos" },
  { id: "fila", nome: "Fila e logs" },
  { id: "temas", nome: "Temas" },
  { id: "canais", nome: "Canais" },
] as const;

type Aba = (typeof ABAS)[number]["id"];

function Card({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div className="card-premium p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <p className="mt-2 text-2xl font-bold">{valor}</p>
    </div>
  );
}

function PainelConteudo() {
  const qc = useQueryClient();
  const [aba, setAba] = useState<Aba>("dashboard");

  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const painel = useQuery({
    queryKey: ["conteudo-painel"],
    queryFn: () => painelConteudoFn(),
    enabled: permissao.data === true,
  });
  const temas = useQuery({
    queryKey: ["conteudo-temas"],
    queryFn: () => listarTemasFn(),
    enabled: permissao.data === true && aba === "temas",
  });

  const recarregar = () => {
    qc.invalidateQueries({ queryKey: ["conteudo-painel"] });
    qc.invalidateQueries({ queryKey: ["conteudo-temas"] });
  };

  const acao = <T,>(fn: (v: T) => Promise<unknown>, sucesso: string) =>
    useMutation({
      mutationFn: fn,
      onSuccess: () => {
        toast.success(sucesso);
        recarregar();
      },
      onError: (e: Error) => toast.error(e.message),
    });

  const ciclo = acao((forcar: boolean) => executarCicloFn({ data: { forcar } }), "Ciclo executado.");
  const gerar = acao(
    (nicho: "caminhoneiros" | "motoristas_app") => gerarConteudoFn({ data: { nicho } }),
    "Conteúdo gerado como rascunho.",
  );
  const aprovar = acao((id: string) => aprovarItemFn({ data: { id } }), "Conteúdo aprovado.");
  const excluir = acao((id: string) => excluirItemFn({ data: { id } }), "Conteúdo excluído.");
  const agendar = acao(
    (v: { id: string; quando: string; canais: string[] }) => agendarItemFn({ data: v }),
    "Agendado.",
  );
  const processar = acao(() => processarFilaFn(), "Fila processada.");
  const reprocessar = acao((jobId: string) => reprocessarJobFn({ data: { jobId } }), "Job reprocessado.");
  const salvar = acao((a: Agenda) => salvarAgendaFn({ data: a }), "Agenda salva.");

  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const agendaAtual = agenda ?? painel.data?.agenda ?? null;

  const campo =
    "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring";
  const botao =
    "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="font-display text-2xl font-bold">Central de Conteúdo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calendário editorial, geração com IA, fila de publicação e registros — para os nichos de
          caminhoneiros e motoristas de aplicativo.
        </p>

        {permissao.isPending && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando acesso...
          </p>
        )}
        {permissao.data === false && (
          <div className="mt-8">
            <SemPermissao />
          </div>
        )}

        {permissao.data === true && (
          <>
            <nav className="mt-6 flex flex-wrap gap-2">
              {ABAS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    aba === a.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                  }`}
                >
                  {a.nome}
                </button>
              ))}
            </nav>

            {painel.isPending && (
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
              </p>
            )}

            {painel.data && aba === "dashboard" && (
              <section className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card titulo="Conteúdos" valor={painel.data.resumo.total} />
                  <Card titulo="Próximas publicações" valor={painel.data.resumo.proximos} />
                  <Card titulo="Falhas" valor={painel.data.resumo.falhas} />
                  <Card titulo="Canais sem conexão" valor={painel.data.resumo.naoPublicaveis} />
                </div>

                <div className="card-premium space-y-4 p-6">
                  <h2 className="font-display text-lg font-bold">Agenda automática</h2>
                  {agendaAtual && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="text-sm">
                        <span className="mb-1 block font-semibold">Caminhoneiros</span>
                        <input
                          type="time"
                          className={campo}
                          value={agendaAtual.horarioCaminhoneiros}
                          onChange={(e) =>
                            setAgenda({ ...agendaAtual, horarioCaminhoneiros: e.target.value })
                          }
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-semibold">Motoristas de app</span>
                        <input
                          type="time"
                          className={campo}
                          value={agendaAtual.horarioMotoristas}
                          onChange={(e) =>
                            setAgenda({ ...agendaAtual, horarioMotoristas: e.target.value })
                          }
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={agendaAtual.ativo}
                          onChange={(e) => setAgenda({ ...agendaAtual, ativo: e.target.checked })}
                        />
                        Agenda ativa
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={agendaAtual.modoTeste}
                          onChange={(e) => setAgenda({ ...agendaAtual, modoTeste: e.target.checked })}
                        />
                        Modo de teste (só rascunho)
                      </label>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Fuso: {agendaAtual?.timezone}. No modo de teste o conteúdo é gerado e guardado como
                    rascunho, sem publicar em lugar nenhum.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className={botao}
                      disabled={!agendaAtual || salvar.isPending}
                      onClick={() => agendaAtual && salvar.mutate(agendaAtual)}
                    >
                      Salvar agenda
                    </button>
                    <button
                      className={botao}
                      disabled={ciclo.isPending}
                      onClick={() => ciclo.mutate(true)}
                    >
                      {ciclo.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Executar próximo ciclo
                    </button>
                    <button
                      className={botao}
                      disabled={gerar.isPending}
                      onClick={() => gerar.mutate("caminhoneiros")}
                    >
                      <Sparkles className="h-4 w-4" /> Gerar (caminhoneiros)
                    </button>
                    <button
                      className={botao}
                      disabled={gerar.isPending}
                      onClick={() => gerar.mutate("motoristas_app")}
                    >
                      <Sparkles className="h-4 w-4" /> Gerar (motoristas de app)
                    </button>
                  </div>
                </div>
              </section>
            )}

            {painel.data && aba === "conteudos" && (
              <section className="mt-6 space-y-4">
                {painel.data.itens.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum conteúdo gerado ainda.</p>
                )}
                {painel.data.itens.map((i) => (
                  <article key={i.id} className="card-premium p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                        {rotuloStatus(i.status)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {NICHOS[i.nicho as keyof typeof NICHOS] ?? i.nicho}
                      </span>
                      <span className="text-xs text-muted-foreground">/blog/{i.slug}</span>
                    </div>
                    <h3 className="mt-3 font-bold">{i.titulo}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{i.resumo}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {i.status === "draft" && (
                        <button
                          className={botao}
                          onClick={() => aprovar.mutate(i.id)}
                          disabled={aprovar.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Aprovar
                        </button>
                      )}
                      {(i.status === "approved" || i.status === "failed") && (
                        <button
                          className={botao}
                          disabled={agendar.isPending}
                          onClick={() =>
                            agendar.mutate({
                              id: i.id,
                              quando: new Date().toISOString(),
                              canais: ["blog"],
                            })
                          }
                        >
                          <CalendarClock className="h-4 w-4" /> Publicar no blog agora
                        </button>
                      )}
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-destructive"
                        onClick={() => excluir.mutate(i.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {painel.data && aba === "fila" && (
              <section className="mt-6 space-y-6">
                <button className={botao} disabled={processar.isPending} onClick={() => processar.mutate()}>
                  <RefreshCw className="h-4 w-4" /> Processar fila agora
                </button>

                <div className="card-premium overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border/70 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-5 py-4">Conteúdo</th>
                        <th className="px-5 py-4">Canal</th>
                        <th className="px-5 py-4">Situação</th>
                        <th className="px-5 py-4">Agendado</th>
                        <th className="px-5 py-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {painel.data.fila.map((j) => (
                        <tr key={j.id} className="border-b border-border/50 last:border-0">
                          <td className="px-5 py-4">{j.content_items?.titulo ?? "—"}</td>
                          <td className="px-5 py-4">{j.canal}</td>
                          <td className="px-5 py-4">
                            {rotuloStatus(j.status)}
                            {j.ultimo_erro && (
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {j.ultimo_erro}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {new Date(j.agendado_para).toLocaleString("pt-BR")}
                          </td>
                          <td className="px-5 py-4">
                            {j.status !== "published" && (
                              <button
                                className="text-sm font-semibold text-primary hover:underline"
                                onClick={() => reprocessar.mutate(j.id)}
                              >
                                Reprocessar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {painel.data.fila.length === 0 && (
                        <tr>
                          <td className="px-5 py-6 text-muted-foreground" colSpan={5}>
                            Fila vazia.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="card-premium p-5">
                  <h2 className="font-display text-lg font-bold">Registros</h2>
                  <ul className="mt-4 space-y-2 text-sm">
                    {painel.data.logs.map((l) => (
                      <li key={l.id} className="border-b border-border/40 pb-2 last:border-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(l.created_at).toLocaleString("pt-BR")} · {l.nivel}
                        </span>
                        <span className="block">{l.mensagem}</span>
                      </li>
                    ))}
                    {painel.data.logs.length === 0 && (
                      <li className="text-muted-foreground">Sem registros ainda.</li>
                    )}
                  </ul>
                </div>
              </section>
            )}

            {aba === "temas" && (
              <section className="mt-6">
                {temas.isPending && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando temas...
                  </p>
                )}
                <ul className="space-y-2">
                  {(temas.data ?? []).map((t) => (
                    <li
                      key={t.id}
                      className="card-premium flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div>
                        <p className="font-semibold">{t.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {NICHOS[t.nicho as keyof typeof NICHOS] ?? t.nicho} · {t.palavra_chave}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={t.ativo}
                            onChange={(e) =>
                              alternarTemaFn({ data: { id: t.id, ativo: e.target.checked } }).then(
                                recarregar,
                              )
                            }
                          />
                          Ativo
                        </label>
                        <button
                          className="text-sm font-semibold text-primary hover:underline"
                          onClick={() => gerarConteudoFn({ data: { topicId: t.id } }).then(recarregar)}
                        >
                          Gerar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {painel.data && aba === "canais" && (
              <section className="mt-6 space-y-3">
                {CANAIS.map((c) => {
                  const conta = painel.data.contas.find((x) => x.canal === c.id);
                  return (
                    <div key={c.id} className="card-premium p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold">{c.nome}</p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            conta?.conectado ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {conta?.conectado ? "Publicação ativa" : "Sem conexão"}
                        </span>
                      </div>
                      {!conta?.conectado && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Adaptador pronto. Falta autorizar a conta e cadastrar a credencial
                          {conta?.secret_esperado ? ` (${conta.secret_esperado})` : ""} em Configurações
                          do projeto → Secrets. Nada é publicado neste canal até lá.
                        </p>
                      )}
                    </div>
                  );
                })}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
