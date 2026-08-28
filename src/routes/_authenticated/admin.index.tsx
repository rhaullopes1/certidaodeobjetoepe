import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, LogOut, Scale, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listarPedidos, souEquipe, type Filtros } from "@/lib/admin";
import { ESTADOS, FLUXO_STATUS, statusPedido } from "@/lib/site";

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

export function AdminHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="surface-navy">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link to="/admin" className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-foreground/15">
            <Scale className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className="font-display text-sm font-bold">Painel administrativo</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary-foreground font-semibold" }}
            className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            Pedidos
          </Link>
          <Link
            to="/admin/historico"
            activeProps={{ className: "text-primary-foreground font-semibold" }}
            className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            Histórico
          </Link>
          <Link
            to="/admin/recuperacao"
            activeProps={{ className: "text-primary-foreground font-semibold" }}
            className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            Recuperação
          </Link>
          <Link
            to="/admin/documentos"
            activeProps={{ className: "text-primary-foreground font-semibold" }}
            className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            Documentos
          </Link>
        </nav>
        <button
          onClick={sair}
          className="inline-flex items-center gap-2 text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
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

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
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

            {pedidos.isPending && (
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando pedidos...
              </p>
            )}

            {pedidos.data && pedidos.data.length === 0 && (
              <p className="mt-8 text-sm text-muted-foreground">
                Nenhum pedido encontrado com esses filtros.
              </p>
            )}

            {pedidos.data && pedidos.data.length > 0 && (
              <div className="card-premium mt-8 overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-border/70 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-4">Protocolo</th>
                      <th className="px-5 py-4">Processo</th>
                      <th className="px-5 py-4">Parte envolvida</th>
                      <th className="px-5 py-4">CPF</th>
                      <th className="px-5 py-4">Situação</th>
                      <th className="px-5 py-4">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.data.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0">
                        <td className="px-5 py-4 font-semibold">
                          <Link
                            to="/admin/$protocolo"
                            params={{ protocolo: p.protocolo }}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {p.protocolo}
                          </Link>
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