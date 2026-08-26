import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logoAsset from "@/assets/logo-certidao.png.asset.json";
import { UserMenu } from "@/components/user-menu";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logoAsset.url}
              alt="Logo Certidão de Objeto e Pé"
              className="h-10 w-10 shrink-0 rounded-xl object-contain"
              width={40}
              height={40}
            />
            <span className="truncate font-display text-base font-bold">Certidão Objeto e Pé</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground md:flex">
              <Link to="/blog" className="hover:text-foreground">Blog</Link>
              <Link to="/tribunais" className="hover:text-foreground">Tribunais</Link>
              <Link to="/certidao-de-objeto-e-pe" className="hover:text-foreground">Estados</Link>
              <Link to="/solicitar" className="hover:text-foreground">Solicitar</Link>
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="surface-navy px-5 py-12 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Certidão Objeto e Pé — atendimento em todo o Brasil.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/blog" className="hover:text-primary-foreground">Blog</Link>
            <Link to="/tribunais" className="hover:text-primary-foreground">Tribunais</Link>
            <Link to="/politica-de-privacidade" className="hover:text-primary-foreground">Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-primary-foreground">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
