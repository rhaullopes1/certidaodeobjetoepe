import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, LogOut, Scale, ShieldAlert, Menu, X, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  listarEntregasPendentes,
  listarPedidos,
  souEquipe,
  type Filtros,
  type PedidoAdmin,
} from "@/lib/admin";
import { ESTADOS, FLUXO_STATUS, statusPedido } from "@/lib/site";
import { linkWhatsappCliente, normalizarWhatsapp } from "@/lib/whatsapp-cliente";

/** Botão de contato rápido via WhatsApp para um pedido do painel. */
function BotaoWhatsApp({ pedido }: { pedido: PedidoAdmin }) {
  const link = linkWhatsappCliente({
    protocolo: pedido.protocolo,
    nome_parte: pedido.nome_parte,
    whatsapp: pedido.whatsapp,
    status: pedido.status,
  });
  const pendente = pedido.status === "aguardando_pagamento";
  const numeroOk = normalizarWhatsapp(pedido.whatsapp) !== null;

  const base =
    "inline-flex items-center justify-center rounded-full p-2 transition-colors";
  const cor = pendente
    ? "bg-accent/20 text-accent hover:bg-accent/30 ring-1 ring-accent/40"
    : "bg-secondary text-muted-foreground hover:bg-secondary/70";
  const classe = numeroOk ? `${base} ${cor}` : `${base} bg-secondary/60 text-muted-foreground/40 cursor-not-allowed`;

  const label = pendente
    ? "Abrir WhatsApp para ajudar a finalizar o pagamento"
    : "Abrir WhatsApp com mensagem de acompanhamento";

  if (!numeroOk) {
    return (
      <span
        className={classe}
        title="Número de WhatsApp não disponível para este pedido"
        aria-label="WhatsApp indisponível"
      >
        <MessageCircle className="h-4 w-4 opacity-60" />
      </span>
    );
  }

  return (
    <a
      href={link!}
      target="_blank"
      rel="noopener noreferrer"
      className={classe}
      title={label}
      aria-label={label}
    >
      <MessageCircle className="h-4 w-4" />
    </a>
  );
}

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminLista,
  head: () => ({
    meta: [
      { title: "Painel de pedidos | Certidão Objeto e Pé" },
      { name: "description", content: "Painel interno de acompanhamento dos pedidos de certidão." },
      { property: "og:title", content: "Painel de pedidos | Certidão Objeto e Pé" },
      { property: "og:description", content: "Área interna de gestão dos pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const LINKS_ADMIN = [
  { to: "/admin", label: "Pedidos", exact: true },
  { to: "/admin/entregas", label: "Entregas", contador: true },
  { to: "/admin/historico", label: "Histórico" },
  { to: "/admin/recuperacao", label: "Recuperação" },
  { to: "/admin/emails", label: "E-mails" },
  { to: "/admin/documentos", label: "Documentos" },
  { to: "/admin/conteudo", label: "Conteúdo" },
] satisfies { to: string; label: string; exact?: boolean; contador?: boolean }[];


export function AdminHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const linkClass = "text-primary-foreground/70 transition-colors hover:text-primary-foreground";
  const linkAtivo = { className: "text-primary-foreground font-semibold" };

  const pendentes = useQuery({
    queryKey: ["admin-entregas-total"],
    queryFn: async () => (await listarEntregasPendentes()).length,
    staleTime: 30_000,
  });

  const Contador = () =>
    pendentes.data && pendentes.data > 0 ? (
      <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold text-accent-foreground">
        {pendentes.data}
      </span>
    ) : null;

  return (
    <header className="surface-navy w-full max-w-full">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-8 sm:py-5 md:flex md:justify-between md:gap-4">
        <Link to="/admin" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-foreground/15">
            <Scale className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className="truncate font-display text-sm font-bold">Painel administrativo</span>
        </Link>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-label="Abrir menu do painel"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary-foreground/20 p-2 text-primary-foreground md:hidden"
        >
          {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          {LINKS_ADMIN.map((l) => (
            <Link
              key={l.to}
              to={l.to as never}
              {...(l.exact ? { activeOptions: { exact: true } } : {})}
              activeProps={linkAtivo}
              className={`${linkClass} inline-flex items-center`}
            >
              {l.label}
              {"contador" in l && l.contador ? <Contador /> : null}
            </Link>
          ))}
        </nav>

        <button
          onClick={sair}
          className="hidden items-center gap-2 text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground md:inline-flex"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>

        {aberto && (
          <nav className="col-span-2 flex w-full flex-col gap-1 border-t border-primary-foreground/15 pt-3 text-sm md:hidden">
            {LINKS_ADMIN.map((l) => (
              <Link
                key={l.to}
                to={l.to as never}
                {...(l.exact ? { activeOptions: { exact: true } } : {})}
                activeProps={linkAtivo}
                className={`${linkClass} rounded-lg px-2 py-2`}
                onClick={() => setAberto(false)}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={sair}
              className="mt-1 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-left text-primary-foreground/75 transition-colors hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}


export function SemPermissao() {
  return (
    <div className="card-premium p-8">
      <ShieldAlert className="h-6 w-6 text-accent" />
      <h2 className="mt-4 text-lg font-bold">Acesso ainda não liberado</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sua conta foi criada, mas ainda não tem permissão de equipe. Um administrador precisa
        liberar seu acesso no backend (tabela de papéis de usuário) para você ver os pedidos.
      </p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const s = statusPedido(status);
  const cor =
    s.tom === "pago"
      ? "bg-accent/15 text-accent"
      : s.tom === "cancelado"
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cor}`}>
      {s.label}
    </span>
  );
}

function AdminLista() {
  const [filtros, setFiltros] = useState<Filtros>({ protocolo: "", cpf: "", uf: "", status: "" });
  const [aplicados, setAplicados] = useState<Filtros>(filtros);
  const [somenteNovos, setSomenteNovos] = useState(false);

  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const pedidos = useQuery({
    queryKey: ["admin-pedidos", aplicados],
    queryFn: () => listarPedidos(aplicados),
    enabled: permissao.data === true,
  });

  const lista = (pedidos.data ?? []).filter((p) => (somenteNovos ? p.novo : true));
  const totalNovos = (pedidos.data ?? []).filter((p) => p.novo).length;
  const totalDuplicados = (pedidos.data ?? []).filter((p) => p.duplicado).length;

  const campo =
    "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-ring";

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busque por protocolo, CPF ou estado do processo e acompanhe até a emissão da certidão.
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAplicados(filtros);
              }}
              className="card-premium mt-8 grid gap-4 p-5 sm:p-6 md:grid-cols-[1fr_1fr_140px_1fr_auto]"
            >
              <input
                className={campo}
                placeholder="Protocolo"
                value={filtros.protocolo}
                onChange={(e) => setFiltros({ ...filtros, protocolo: e.target.value })}
                aria-label="Filtrar por protocolo"
              />
              <input
                className={campo}
                placeholder="CPF"
                value={filtros.cpf}
                onChange={(e) => setFiltros({ ...filtros, cpf: e.target.value })}
                aria-label="Filtrar por CPF"
              />
              <select
                className={campo}
                value={filtros.uf}
                onChange={(e) => setFiltros({ ...filtros, uf: e.target.value })}
                aria-label="Filtrar por estado"
              >
                <option value="">UF</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              <select
                className={campo}
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                aria-label="Filtrar por situação"
              >
                <option value="">Todas as situações</option>
                {FLUXO_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {statusPedido(s).label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Search className="h-4 w-4" /> Buscar
              </button>
            </form>

            {pedidos.data && pedidos.data.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={somenteNovos}
                    onChange={(e) => setSomenteNovos(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  Somente novos (24h)
                </label>
                <span className="text-muted-foreground">
                  {totalNovos} novo(s) · {totalDuplicados} com possível duplicidade
                </span>
              </div>
            )}

            {pedidos.isPending && (
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando pedidos...
              </p>
            )}

            {pedidos.data && lista.length === 0 && (
              <p className="mt-8 text-sm text-muted-foreground">
                Nenhum pedido encontrado com esses filtros.
              </p>
            )}

            {lista.length > 0 && (
              <div className="card-premium mt-8 w-full max-w-full overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-b border-border/70 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-4">Protocolo</th>
                      <th className="px-5 py-4">Processo</th>
                      <th className="px-5 py-4">Parte envolvida</th>
                      <th className="px-5 py-4">CPF</th>
                      <th className="px-5 py-4">Situação</th>
                      <th className="px-5 py-4">Criado em</th>
                      <th className="px-5 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0">
                        <td className="px-5 py-4 font-semibold">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to="/admin/$protocolo"
                              params={{ protocolo: p.protocolo }}
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              {p.protocolo}
                            </Link>
                            {p.novo && (
                              <span className="inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
                                Novo
                              </span>
                            )}
                            {p.duplicado && (
                              <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-destructive">
                                Possível duplicidade
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">{p.numero_processo}</td>
                        <td className="px-5 py-4">{p.nome_parte ?? "—"}</td>
                        <td className="px-5 py-4">{p.cpf}</td>
                        <td className="px-5 py-4">
                          <Badge status={p.status} />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {new Date(p.created_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <BotaoWhatsApp pedido={p} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}