import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";
import {
  GOOGLE_PROFILE,
  INSTAGRAM_PROFILE,
  TIKTOK_PROFILE,
  YOUTUBE_CHANNEL,
} from "@/lib/site";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main>{children}</main>

      <footer className="surface-navy px-5 py-12 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Certidão Objeto e Pé — atendimento em todo o Brasil.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/certidao-de-objeto-e-pe/para" className="hover:text-primary-foreground">Para você</Link>
            <Link to="/guias" className="hover:text-primary-foreground">Guias</Link>
            <Link to="/blog" className="hover:text-primary-foreground">Blog</Link>
            <Link to="/tribunais" className="hover:text-primary-foreground">Tribunais</Link>
            <Link to="/sobre" className="hover:text-primary-foreground">Sobre</Link>
            <Link to="/garantia" className="hover:text-primary-foreground">Garantia</Link>
            <Link to="/politica-de-privacidade" className="hover:text-primary-foreground">Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-primary-foreground">Termos</Link>
            <a
              href={GOOGLE_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground"
            >
              Google
            </a>
            <a
              href={TIKTOK_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground"
            >
              TikTok
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
