import { useRouterState } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/site";
import { PUBLICO_POR_SLUG } from "@/lib/publicos-seo";

/** Rotas internas/de checkout onde o botão atrapalharia. */
const OCULTAR = [/^\/admin/, /^\/operacao/, /^\/auth/, /^\/minha-conta/, /^\/solicitar/, /^\/pedido\//];

function mensagemPara(pathname: string) {
  const nicho = pathname.match(/^\/certidao-de-objeto-e-pe\/para\/([^/]+)/)?.[1];
  const publico = nicho ? PUBLICO_POR_SLUG.get(nicho) : undefined;
  if (publico) {
    return `Olá! Preciso de ajuda com a Certidão de Objeto e Pé (${publico.rotulo}).`;
  }
  return "Olá! Preciso de ajuda com a Certidão de Objeto e Pé.";
}

/** Botão flutuante verde de WhatsApp — exibido só no site comercial. */
export function WhatsAppFlutuante() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (OCULTAR.some((r) => r.test(pathname))) return null;

  return (
    <a
      href={whatsappLink(mensagemPara(pathname))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-xl ring-4 ring-whatsapp/20 transition-transform hover:scale-105 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3.5"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7 sm:h-6 sm:w-6">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.75.98 1-3.65-.23-.38a9.86 9.86 0 0 1-1.51-5.26C2.15 6.44 6.6 2 12.06 2a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.46-4.45 9.9-9.9 9.9Zm8.42-18.32A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.9-11.9a11.83 11.83 0 0 0-3.48-8.42Z" />
      </svg>
      <span className="hidden text-sm font-bold sm:inline">Falar no WhatsApp</span>
    </a>
  );
}
