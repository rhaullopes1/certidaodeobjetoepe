import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FileText, LayoutDashboard, LogIn, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { carregarPerfil, iniciais } from "@/lib/perfil";
import { souEquipe } from "@/lib/admin";

export function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  const perfil = useQuery({ queryKey: ["perfil"], queryFn: carregarPerfil });
  const equipe = useQuery({
    queryKey: ["sou-equipe"],
    queryFn: souEquipe,
    enabled: Boolean(perfil.data),
  });

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  async function sair() {
    setAberto(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (perfil.isPending) return <span className="h-9 w-9 rounded-full bg-secondary" aria-hidden />;

  if (!perfil.data) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-2 rounded-full border border-input px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );
  }

  const p = perfil.data;

  return (
    <div className="relative" ref={caixa}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label="Abrir menu do usuário"
        className="flex items-center gap-2 rounded-full border border-input py-1 pl-1 pr-3 transition-colors hover:bg-secondary"
      >
        {p.avatar_url ? (
          <img
            src={p.avatar_url}
            alt={p.nome ?? "Perfil"}
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {iniciais(p)}
          </span>
        )}
        <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:block">
          {p.nome ?? p.email}
        </span>
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-border bg-background p-2 shadow-xl"
        >
          <div className="border-b border-border/70 px-3 pb-3 pt-2">
            <p className="truncate text-sm font-bold">{p.nome ?? "Usuário"}</p>
            <p className="truncate text-xs text-muted-foreground">{p.email}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              login via {p.provider ?? "e-mail"}
            </p>
          </div>
          <Link
            to="/minha-conta"
            onClick={() => setAberto(false)}
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
          >
            <FileText className="h-4 w-4" /> Meus pedidos
          </Link>
          {equipe.data && (
            <>
              <Link
                to="/admin"
                onClick={() => setAberto(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <LayoutDashboard className="h-4 w-4" /> Back office
              </Link>
              <Link
                to="/admin/documentos"
                onClick={() => setAberto(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <User className="h-4 w-4" /> Documentos
              </Link>
            </>
          )}
          <button
            onClick={sair}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}