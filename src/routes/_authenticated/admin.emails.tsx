import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Send, Save, Trash2, CalendarClock, Users } from "lucide-react";
import { AdminHeader, SemPermissao } from "./admin.index";
import { souEquipe } from "@/lib/admin";
import {
  painelEmailsFn,
  salvarBoasVindas,
  testarBoasVindas,
  salvarCampanhaFn,
  excluirCampanhaFn,
  enviarCampanhaAgora,
  contatosCampanha,
} from "@/lib/emails.functions";

export const Route = createFileRoute("/_authenticated/admin/emails")({
  component: EmailsPage,
  head: () => ({
    meta: [
      { title: "Automação de e-mails | Certidão Objeto e Pé" },
      {
        name: "description",
        content: "Boas-vindas, campanhas semanais e métricas de e-mail da plataforma.",
      },
      { property: "og:title", content: "Automação de e-mails | Certidão Objeto e Pé" },
      { property: "og:description", content: "Painel interno de automação de e-mails." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const VARIAVEIS = ["{{nome_cliente}}", "{{email_cliente}}"];

function dataBr(valor: string | null) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function Metrica({ titulo, valor, detalhe }: { titulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-wide text-white/50">{titulo}</p>
      <p className="mt-2 font-display text-3xl font-bold text-white">{valor}</p>
      {detalhe ? <p className="mt-1 text-xs text-white/50">{detalhe}</p> : null}
    </div>
  );
}

function Preview({ assunto, corpo }: { assunto: string; corpo: string }) {
  const exemplo = (t: string) =>
    t
      .replace(/\{\{\s*nome_cliente\s*\}\}/g, "Maria")
      .replace(/\{\{\s*email_cliente\s*\}\}/g, "maria@email.com");
  return (
    <div className="rounded-2xl border border-white/10 bg-white p-5 text-[#233047]">
      <p className="text-[11px] uppercase tracking-[1px] text-[#B08D3F]">
        Certidão de Objeto e Pé
      </p>
      <p className="mt-2 font-display text-lg font-bold text-[#0B1F3A]">{exemplo(assunto)}</p>
      <div className="mt-3 space-y-2 text-sm leading-6 whitespace-pre-wrap">{exemplo(corpo)}</div>
    </div>
  );
}

const entrada =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40";
const botao =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] transition hover:bg-white/90 disabled:opacity-50";
const botaoGhost =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50";

type CampanhaForm = {
  id?: string;
  titulo: string;
  assunto: string;
  conteudo: string;
  agendamento: string;
};

const CAMPANHA_VAZIA: CampanhaForm = { titulo: "", assunto: "", conteudo: "", agendamento: "" };

function EmailsPage() {
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const carregar = useServerFn(painelEmailsFn);
  const queryClient = useQueryClient();
  const [aba, setAba] = useState<"metricas" | "boas-vindas" | "campanhas">("metricas");
  const [aviso, setAviso] = useState<string | null>(null);

  const painel = useQuery({
    queryKey: ["painel-emails"],
    queryFn: () => carregar({ data: undefined }),
    enabled: permissao.data === true,
  });

  const contatos = useServerFn(contatosCampanha);
  const base = useQuery({
    queryKey: ["contatos-campanha"],
    queryFn: () => contatos({ data: undefined }),
    enabled: permissao.data === true,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["painel-emails"] });

  // ---- boas-vindas -------------------------------------------------
  const [bvAssunto, setBvAssunto] = useState("");
  const [bvCorpo, setBvCorpo] = useState("");
  const [bvAtivo, setBvAtivo] = useState(true);
  const [emailTeste, setEmailTeste] = useState("");

  useEffect(() => {
    const c = painel.data?.boasVindas;
    if (!c) return;
    setBvAssunto(c.assunto);
    setBvCorpo(c.corpo);
    setBvAtivo(c.ativo);
  }, [painel.data?.boasVindas]);

  const salvarBv = useServerFn(salvarBoasVindas);
  const testarBv = useServerFn(testarBoasVindas);

  const salvarBoasVindasMut = useMutation({
    mutationFn: () =>
      salvarBv({ data: { assunto: bvAssunto, corpo: bvCorpo, ativo: bvAtivo } }),
    onSuccess: () => {
      setAviso("Texto de boas-vindas salvo.");
      invalidar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const testarBoasVindasMut = useMutation({
    mutationFn: () => testarBv({ data: { email: emailTeste.trim(), nome: "Maria" } }),
    onSuccess: () => setAviso("E-mail de teste enviado."),
    onError: (e: Error) => setAviso(e.message),
  });

  // ---- campanhas ---------------------------------------------------
  const [form, setForm] = useState<CampanhaForm>(CAMPANHA_VAZIA);
  const salvarCamp = useServerFn(salvarCampanhaFn);
  const excluirCamp = useServerFn(excluirCampanhaFn);
  const enviarCamp = useServerFn(enviarCampanhaAgora);

  const salvarCampanhaMut = useMutation({
    mutationFn: (status: "rascunho" | "agendado") =>
      salvarCamp({
        data: {
          ...(form.id ? { id: form.id } : {}),
          titulo: form.titulo.trim(),
          assunto: form.assunto.trim(),
          conteudo: form.conteudo.trim(),
          agendamento: form.agendamento ? new Date(form.agendamento).toISOString() : null,
          status,
        },
      }),
    onSuccess: (r, status) => {
      setForm((f) => ({ ...f, id: r.id }));
      setAviso(status === "agendado" ? "Campanha agendada." : "Rascunho salvo.");
      invalidar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const enviarAgoraMut = useMutation({
    mutationFn: (id: string) => enviarCamp({ data: { id } }),
    onSuccess: (r: any) => {
      setAviso(`Disparo concluído: ${r?.enviados ?? 0} e-mail(s) enviado(s).`);
      invalidar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const excluirMut = useMutation({
    mutationFn: (id: string) => excluirCamp({ data: { id } }),
    onSuccess: () => {
      setForm(CAMPANHA_VAZIA);
      setAviso("Rascunho excluído.");
      invalidar();
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const metricas = painel.data?.metricas;
  const campanhas = useMemo(() => painel.data?.campanhas ?? [], [painel.data?.campanhas]);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-2xl font-bold">Automação de e-mails</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Boas-vindas, campanhas semanais e métricas de engajamento da base de clientes.
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
          <div className="mt-8 rounded-3xl bg-[#0B1F3A] p-5 text-white shadow-xl sm:p-8">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["metricas", "Métricas gerais"],
                  ["boas-vindas", "Boas-vindas"],
                  ["campanhas", "Campanhas semanais"],
                ] as const
              ).map(([chave, rotulo]) => (
                <button
                  key={chave}
                  onClick={() => setAba(chave)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    aba === chave ? "bg-white text-[#0B1F3A]" : "bg-white/10 text-white/80"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            {aviso && (
              <p className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm">
                {aviso}
              </p>
            )}

            {painel.isPending && (
              <p className="mt-6 flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados...
              </p>
            )}

            {/* ---------------- métricas ---------------- */}
            {aba === "metricas" && metricas && (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metrica
                    titulo="Clientes cadastrados"
                    valor={String(metricas.totalClientes)}
                    detalhe={`${metricas.clientesAtivos} com conta ativa`}
                  />
                  <Metrica
                    titulo="Taxa de abertura"
                    valor={`${metricas.taxaAbertura}%`}
                    detalhe={`${metricas.taxaCliques}% de cliques`}
                  />
                  <Metrica
                    titulo="Pedidos recuperados"
                    valor={String(metricas.pedidosRecuperados)}
                    detalhe="pela régua de pendentes"
                  />
                  <Metrica
                    titulo="Valor recuperado"
                    valor={metricas.valorRecuperadoFormatado}
                    detalhe="total confirmado"
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Metrica
                    titulo="Contatos alcançáveis"
                    valor={String(metricas.contatosAlcancaveis)}
                    detalhe="contas + clientes com pedido"
                  />
                  <Metrica
                    titulo="E-mails de campanha enviados"
                    valor={String(metricas.emailsEnviados)}
                  />
                  <Metrica titulo="Descadastrados" valor={String(metricas.descadastrados)} />
                </div>
                <p className="mt-4 text-xs text-white/50">
                  A régua de recuperação de pedidos pendentes (30 min, 12h e 48h) continua na aba
                  Recuperação do menu.
                </p>
              </>
            )}

            {/* ---------------- boas-vindas ---------------- */}
            {aba === "boas-vindas" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wide text-white/50">
                    Assunto
                  </label>
                  <input
                    className={entrada}
                    value={bvAssunto}
                    onChange={(e) => setBvAssunto(e.target.value)}
                  />
                  <label className="block text-xs uppercase tracking-wide text-white/50">
                    Corpo do e-mail
                  </label>
                  <textarea
                    rows={14}
                    className={entrada}
                    value={bvCorpo}
                    onChange={(e) => setBvCorpo(e.target.value)}
                  />
                  <p className="text-xs text-white/50">
                    Variáveis disponíveis: {VARIAVEIS.join("  ")}
                  </p>
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={bvAtivo}
                      onChange={(e) => setBvAtivo(e.target.checked)}
                    />
                    Enviar automaticamente em novos cadastros
                  </label>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      className={botao}
                      disabled={salvarBoasVindasMut.isPending}
                      onClick={() => salvarBoasVindasMut.mutate()}
                    >
                      <Save className="h-4 w-4" /> Salvar
                    </button>
                    <input
                      className={`${entrada} max-w-[220px]`}
                      placeholder="e-mail para teste"
                      value={emailTeste}
                      onChange={(e) => setEmailTeste(e.target.value)}
                    />
                    <button
                      className={botaoGhost}
                      disabled={!emailTeste.trim() || testarBoasVindasMut.isPending}
                      onClick={() => testarBoasVindasMut.mutate()}
                    >
                      <Send className="h-4 w-4" /> Enviar teste
                    </button>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
                    Pré-visualização
                  </p>
                  <Preview assunto={bvAssunto} corpo={bvCorpo} />
                </div>
              </div>
            )}

            {/* ---------------- campanhas ---------------- */}
            {aba === "campanhas" && (
              <div className="mt-6 space-y-8">
                <p className="flex items-center gap-2 text-sm text-white/70">
                  <Users className="h-4 w-4" />
                  {base.data
                    ? `${base.data.total} contatos ativos (${base.data.comConta} com conta).`
                    : "Calculando base de contatos..."}{" "}
                  Disparo automático toda terça-feira às 09:00.
                </p>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <input
                      className={entrada}
                      placeholder="Título interno da campanha"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    />
                    <input
                      className={entrada}
                      placeholder="Assunto do e-mail"
                      value={form.assunto}
                      onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                    />
                    <textarea
                      rows={12}
                      className={entrada}
                      placeholder="Conteúdo do e-mail"
                      value={form.conteudo}
                      onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                    />
                    <label className="block text-xs uppercase tracking-wide text-white/50">
                      Agendamento
                    </label>
                    <input
                      type="datetime-local"
                      className={entrada}
                      value={form.agendamento}
                      onChange={(e) => setForm({ ...form, agendamento: e.target.value })}
                    />
                    <p className="text-xs text-white/50">
                      Variáveis disponíveis: {VARIAVEIS.join("  ")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        className={botaoGhost}
                        disabled={salvarCampanhaMut.isPending}
                        onClick={() => salvarCampanhaMut.mutate("rascunho")}
                      >
                        <Save className="h-4 w-4" /> Salvar rascunho
                      </button>
                      <button
                        className={botaoGhost}
                        disabled={!form.agendamento || salvarCampanhaMut.isPending}
                        onClick={() => salvarCampanhaMut.mutate("agendado")}
                      >
                        <CalendarClock className="h-4 w-4" /> Agendar
                      </button>
                      <button
                        className={botao}
                        disabled={!form.id || enviarAgoraMut.isPending}
                        onClick={() => form.id && enviarAgoraMut.mutate(form.id)}
                      >
                        {enviarAgoraMut.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        Enviar agora para todos
                      </button>
                      {form.id && (
                        <button
                          className={botaoGhost}
                          onClick={() => excluirMut.mutate(form.id!)}
                          disabled={excluirMut.isPending}
                        >
                          <Trash2 className="h-4 w-4" /> Excluir
                        </button>
                      )}
                      {form.id && (
                        <button className={botaoGhost} onClick={() => setForm(CAMPANHA_VAZIA)}>
                          Nova campanha
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
                      Pré-visualização
                    </p>
                    <Preview assunto={form.assunto} corpo={form.conteudo} />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-wide text-white/50">
                    Histórico de disparos
                  </p>
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
                        <tr>
                          <th className="px-4 py-3">Campanha</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Agendada</th>
                          <th className="px-4 py-3">Enviada</th>
                          <th className="px-4 py-3">Entregas</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {campanhas.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-white/60" colSpan={6}>
                              Nenhuma campanha criada ainda.
                            </td>
                          </tr>
                        )}
                        {campanhas.map((c) => (
                          <tr key={c.id} className="border-t border-white/10">
                            <td className="px-4 py-3">
                              <p className="font-medium">{c.titulo}</p>
                              <p className="text-xs text-white/50">{c.assunto}</p>
                            </td>
                            <td className="px-4 py-3 capitalize text-white/80">{c.status}</td>
                            <td className="px-4 py-3 text-white/70">
                              {dataBr(c.agendamento_data)}
                            </td>
                            <td className="px-4 py-3 text-white/70">{dataBr(c.enviado_em)}</td>
                            <td className="px-4 py-3 text-white/70">
                              {c.total_enviados}/{c.total_destinatarios}
                              {c.total_falhas ? ` (${c.total_falhas} falhas)` : ""}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className={botaoGhost}
                                onClick={() =>
                                  setForm({
                                    id: c.id,
                                    titulo: c.titulo,
                                    assunto: c.assunto,
                                    conteudo: c.conteudo_html,
                                    agendamento: c.agendamento_data
                                      ? new Date(c.agendamento_data).toISOString().slice(0, 16)
                                      : "",
                                  })
                                }
                              >
                                Abrir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
