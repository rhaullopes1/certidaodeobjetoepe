import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileText, HelpCircle, Menu, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { whatsappLink } from "@/lib/site";

const ajudaWhatsApp = whatsappLink(
  "Olá! Tenho uma dúvida sobre a Certidão de Objeto e Pé. Podem me ajudar?",
);

const links = [
  { label: "Início", to: "/" as const },
  { label: "Como funciona", to: "/" as const, hash: "como-funciona" },
  { label: "Dúvidas frequentes", to: "/" as const, hash: "faq" },
  { label: "Tribunais", to: "/tribunais" as const },
  { label: "Guias", to: "/guias" as const },
  { label: "Blog", to: "/blog" as const },
  { label: "Acompanhar pedido", to: "/acompanhar" as const },
];

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);
  const cabecalho = useRef<HTMLElement>(null);

  useEffect(() => {
    function fecharFora(event: MouseEvent) {
      if (cabecalho.current && !cabecalho.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  return (
    <header
      ref={cabecalho}
      className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setAberto(false)}>
          <img
            src="/favicon.png"
            alt="Certidão de Objeto e Pé"
            className="h-10 w-10 shrink-0 object-contain"
            width={40}
            height={40}
          />
          <span className="min-w-0 truncate font-display text-sm font-bold sm:text-base">
            Certidão Objeto e Pé
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground lg:flex" aria-label="Navegação principal">
            <Link to="/" hash="como-funciona" className="transition-colors hover:text-foreground">
              Como funciona
            </Link>
            <Link to="/" hash="faq" className="transition-colors hover:text-foreground">
              Dúvidas
            </Link>
            <Link to="/tribunais" className="transition-colors hover:text-foreground">
              Tribunais
            </Link>
            <Link to="/acompanhar" className="transition-colors hover:text-foreground">
              Acompanhar
            </Link>
            <Link
              to="/solicitar"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" aria-hidden />
              Solicitar
            </Link>
          </nav>
          <UserMenu />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={aberto ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={aberto}
            aria-controls="menu-site"
            onClick={() => setAberto((atual) => !atual)}
          >
            {aberto ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </div>

      {aberto && (
        <nav
          id="menu-site"
          aria-label="Menu do site"
          className="absolute inset-x-0 top-full border-b border-border bg-background px-4 pb-5 pt-2 shadow-xl lg:hidden"
        >
          <div className="mx-auto grid max-w-6xl gap-1">
            {links.map((item) => (
              <Link
                key={`${item.to}-${item.hash ?? ""}`}
                to={item.to}
                hash={item.hash}
                onClick={() => setAberto(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <a
                href={ajudaWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-input px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                onClick={() => setAberto(false)}
              >
                <HelpCircle className="h-4 w-4" aria-hidden />
                Tirar dúvidas
              </a>
              <Link
                to="/solicitar"
                onClick={() => setAberto(false)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Solicitar
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}