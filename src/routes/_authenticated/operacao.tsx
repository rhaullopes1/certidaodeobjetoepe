import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { meusPapeis, ehAdministrativo, ehOperador } from "@/lib/papeis";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/operacao")({
  ssr: false,
  beforeLoad: async () => {
    const papeis = await meusPapeis();
    if (ehOperador(papeis) && !ehAdministrativo(papeis)) return;
    if (ehAdministrativo(papeis)) throw redirect({ to: "/admin/operacao" });
    throw redirect({ to: "/minha-conta" });
  },
  head: () => ({
    meta: [
      { title: "Painel Operacional | Certidão de Objeto e Pé" },
      { name: "description", content: "Área restrita do operador de certidões." },
      { property: "og:title", content: "Painel Operacional" },
      { property: "og:description", content: "Área restrita do operador de certidões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Layout,
});

function Layout() {
  const qc = useQueryClient();
  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/operacao" className="flex items-center gap-2 font-bold">
            <Scale className="h-5 w-5 text-primary" /> Painel Operacional
          </Link>
          <nav className="flex items-center gap-4 text-sm">
          <Link to="/operacao" activeOptions={{ exact: true }} activeProps={{ className: "font-semibold text-foreground" }} className="text-muted-foreground">Minhas operações</Link>
          <Link to="/operacao/historico" activeProps={{ className: "font-semibold text-foreground" }} className="text-muted-foreground">Histórico</Link>
          <button onClick={sair} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5">
        <Outlet />
        <Toaster richColors position="top-center" />
      </main>
    </div>
  );
}
