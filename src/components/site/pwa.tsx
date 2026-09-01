import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface PromptInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const CHAVE_DISPENSADO = "pwa-convite-dispensado";

/** Registra o service worker e oferece "Instalar app" apenas no celular. */
export function PWA() {
  const [evento, setEvento] = useState<PromptInstalacao | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    function aoPoderInstalar(e: Event) {
      e.preventDefault();
      if (localStorage.getItem(CHAVE_DISPENSADO) === "1") return;
      if (!window.matchMedia("(max-width: 768px)").matches) return;
      setEvento(e as PromptInstalacao);
      setVisivel(true);
    }

    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    return () => window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
  }, []);

  if (!visivel || !evento) return null;

  function dispensar() {
    localStorage.setItem(CHAVE_DISPENSADO, "1");
    setVisivel(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-lg md:hidden">
      <Download className="h-5 w-5 shrink-0 text-accent" aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-medium">
        Instale o app para acompanhar seu pedido mais rápido.
      </p>
      <button
        type="button"
        onClick={() => {
          void evento.prompt();
          void evento.userChoice.finally(() => dispensar());
        }}
        className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
      >
        Instalar
      </button>
      <button type="button" onClick={dispensar} aria-label="Dispensar" className="p-1">
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
