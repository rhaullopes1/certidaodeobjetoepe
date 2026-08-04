import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { historicoGeral, souEquipe } from "@/lib/admin";
import { statusPedido } from "@/lib/site";
import { AdminHeader, SemPermissao } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/historico")({
  component: Historico,
  head: () => ({
    meta: [
      { title: "Histórico de pedidos | Certidão Objeto e Pé" },
      { name: "description", content: "Histórico de andamentos dos pedidos de certidão." },
      { property: "og:title", content: "Histórico de pedidos | Certidão Objeto e Pé" },
      { property: "og:description", content: "Linha do tempo dos andamentos registrados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Historico() {
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const itens = useQuery({
    queryKey: ["admin-historico"],
    queryFn: historicoGeral,
    enabled: permissao.data === true,
  });

  return (
    <div className="min-h-screen bg-secondary/40">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-2xl font-bold">Histórico de pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todos os andamentos registrados pela equipe, do mais recente ao mais antigo.
        </p>

        {permissao.data === false && (
          <div className="mt-8">
            <SemPermissao />
          </div>
        )}

        {(permissao.isPending || itens.isPending) && permissao.data !== false && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando histórico...
          </p>
        )}

        {itens.data && itens.data.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">Nenhum andamento registrado ainda.</p>
        )}

        {itens.data && itens.data.length > 0 && (
          <ol className="card-premium mt-8 divide-y divide-border/60">
            {itens.data.map((i) => (
              <li key={i.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-bold">
                    {i.pedidos ? (
                      <Link
                        to="/admin/$protocolo"
                        params={{ protocolo: i.pedidos.protocolo }}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {i.pedidos.protocolo}
                      </Link>
                    ) : (
                      "Pedido removido"
                    )}{" "}
                    <span className="font-medium text-muted-foreground">
                      — {statusPedido(i.status).label}
                    </span>
                  </p>
                  {i.observacao && <p className="mt-1 text-sm text-muted-foreground">{i.observacao}</p>}
                  {i.pedidos && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Processo {i.pedidos.numero_processo}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(i.created_at).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}