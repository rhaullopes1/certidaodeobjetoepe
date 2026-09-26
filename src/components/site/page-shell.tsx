import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";
import {
  EMAIL_CONTATO,
  EMPRESA,
  GOOGLE_PROFILE,
  INSTAGRAM_PROFILE,
  PHONE_DISPLAY,
  PHONE_TEL,
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
            <Link to="/garantia" className="hover:text-primary-foreground">Prazo de emissão</Link>
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

        <div className="mx-auto mt-8 w-full max-w-6xl border-t border-primary-foreground/15 pt-6 text-xs leading-relaxed text-primary-foreground/60">
          <p className="mb-2 text-sm font-semibold text-primary-foreground/85">
            Empresa responsável
          </p>
          <p>
            <span className="text-primary-foreground/80">Razão social:</span>{" "}
            {EMPRESA.razaoSocial} — {EMPRESA.nomeFantasia}
          </p>
          <p>
            <span className="text-primary-foreground/80">CNPJ:</span> {EMPRESA.cnpj}
          </p>
          <p>
            <span className="text-primary-foreground/80">Atividade (CNAE):</span> {EMPRESA.cnae}
          </p>
          <p>
            <span className="text-primary-foreground/80">Sede:</span> {EMPRESA.endereco}
          </p>
          <p className="mt-2">
            <span className="text-primary-foreground/80">Atendimento:</span>{" "}
            <a href={PHONE_TEL} className="hover:text-primary-foreground">
              {PHONE_DISPLAY}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${EMAIL_CONTATO}`} className="hover:text-primary-foreground">
              {EMAIL_CONTATO}
            </a>
          </p>
          <p className="mt-3 text-primary-foreground/50">
            Empresa privada de assessoria documental, sem vínculo com órgãos públicos. Informações
            publicadas em conformidade com o Decreto Federal nº 7.962/2013 e o Marco Civil da
            Internet (Lei nº 12.965/2014).
          </p>
        </div>
      </footer>
    </div>
  );
}
