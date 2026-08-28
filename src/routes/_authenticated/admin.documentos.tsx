import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { abrirAnexo, documentosGerais, souEquipe } from "@/lib/admin";
import { AdminHeader, SemPermissao } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/documentos")({
  component: Documentos,
  head: () => ({
    meta: [
      { title: "Documentos | Certidão Objeto e Pé" },
      { name: "description", content: "Comprovantes e certidões anexados aos pedidos." },
      { property: "og:title", content: "Documentos | Certidão Objeto e Pé" },
      { property: "og:description", content: "Arquivos privados vinculados aos pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Documentos() {
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const docs = useQuery({
    queryKey: ["admin-documentos"],
    queryFn: documentosGerais,
    enabled: permissao.data === true,
  });

  async function baixar(caminho: string) {
    const url = await abrirAnexo(caminho);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
        <h1 className="font-display text-2xl font-bold">Documentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comprovantes de pagamento e certidões emitidas, guardados com acesso restrito.
        </p>

        {permissao.data === false && (
          <div className="mt-8">
            <SemPermissao />
          </div>
        )}

        {(permissao.isPending || docs.isPending) && permissao.data !== false && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando documentos...
          </p>
        )}

        {docs.data && docs.data.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">Nenhum documento anexado ainda.</p>
        )}

        {docs.data && docs.data.length > 0 && (
          <ul className="card-premium mt-8 divide-y divide-border/60">
            {docs.data.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.nome_arquivo}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.tipo} ·{" "}
                    {d.pedidos ? (
                      <Link
                        to="/admin/$protocolo"
                        params={{ protocolo: d.pedidos.protocolo }}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {d.pedidos.protocolo}
                      </Link>
                    ) : (
                      "sem pedido"
                    )}{" "}
                    · {new Date(d.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => baixar(d.caminho)}
                  className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  <Download className="h-4 w-4" /> Abrir
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}