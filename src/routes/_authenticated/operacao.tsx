import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { meusPapeis, ehAdministrativo, ehOperador } from "@/lib/papeis";
import { BRANDING_COMERCIAL } from "@/lib/branding";
import { Toaster } from "@/components/ui/sonner";
import { EfficiencyBrand, FlyDoxCredit } from "@/components/operacao/efficiency-brand";
import efficiencyOg from "@/assets/efficiency/og.jpg.asset.json";

const IMAGEM_SOCIAL_OPERACIONAL = `https://operacao.flydox.net${efficiencyOg.url}`;

export const Route = createFileRoute("/_authenticated/operacao")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const papeis = await meusPapeis();
    if (ehOperador(papeis) && !ehAdministrativo(papeis)) return;
    // Portal white-label: quem não é operador não navega para áreas comerciais/admin por aqui.
    if (context.branding.modo === "operacional") throw redirect({ to: "/auth" });
    if (ehAdministrativo(papeis)) throw redirect({ to: "/admin/operacao" });
    throw redirect({ to: "/minha-conta" });
  },
  head: ({ match }) => ({
    meta: [
      { title: match.context?.branding?.modo === "operacional" ? "PORTAL OPERACIONAL | efficiency" : `Painel Operacional${BRANDING_COMERCIAL.sufixoTitulo}` },
      { name: "description", content: match.context?.branding?.modo === "operacional" ? "Acesso restrito ao portal operacional da efficiency." : "Área restrita do operador de certidões." },
      { property: "og:title", content: match.context?.branding?.modo === "operacional" ? "PORTAL OPERACIONAL | efficiency" : "Painel Operacional" },
      { property: "og:description", content: match.context?.branding?.modo === "operacional" ? "Acesso restrito ao portal operacional da efficiency." : "Área restrita do operador de certidões." },
      { property: "og:type", content: "website" },
      ...(match.context?.branding?.modo === "operacional" ? [
        { property: "og:image", content: IMAGEM_SOCIAL_OPERACIONAL },
        { name: "twitter:image", content: IMAGEM_SOCIAL_OPERACIONAL },
      ] : []),
      { name: "twitter:card", content: match.context?.branding?.modo === "operacional" ? "summary_large_image" : "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Layout,
});

function Layout() {
  const qc = useQueryClient();
  const { branding } = Route.useRouteContext();
  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }
  return (
    <div className={branding.modo === "operacional" ? "theme-efficiency efficiency-shell min-h-dvh" : "min-h-screen bg-secondary/30"}>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/operacao" className="flex min-w-0 items-center gap-2 font-bold">
            {branding.modo === "operacional" ? <EfficiencyBrand compact /> : <><Scale className="h-5 w-5 text-primary" /> {branding.nomePainelOperador}</>}
          </Link>
          <nav className="flex items-center gap-1 text-sm" aria-label="Navegação operacional">
          <Link to="/operacao" activeOptions={{ exact: true }} activeProps={{ className: "efficiency-nav-active" }} className="efficiency-nav-link">Operações</Link>
          <Link to="/operacao/metas" activeProps={{ className: "efficiency-nav-active" }} className="efficiency-nav-link">Metas</Link>
          <Link to="/operacao/historico" activeProps={{ className: "efficiency-nav-active" }} className="efficiency-nav-link">Histórico</Link>
          <button onClick={sair} className="efficiency-icon-button" aria-label="Sair" title="Sair">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
          </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
        <Toaster richColors position="top-center" />
      </main>
      {branding.modo === "operacional" && <footer className="px-4 pb-6 pt-2"><FlyDoxCredit /></footer>}
    </div>
  );
}
