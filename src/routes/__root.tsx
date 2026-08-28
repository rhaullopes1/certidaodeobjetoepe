import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Certidão de Objeto e Pé Online | Solicitação em Todo Brasil" },
      {
        name: "description",
        content:
          "Solicite sua Certidão de Objeto e Pé online. Nossa equipe auxilia na solicitação junto aos tribunais brasileiros.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Certidão Objeto e Pé" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "google-site-verification",
        content: "ERp9c95bRqmEYx0_rUsJJbEwd8l6E3o3turNWC-Cks0",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
    scripts: [
      {
        src: "https://www.googletagmanager.com/gtag/js?id=AW-18411209847",
        async: true,
      },
      {
        children:
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'AW-18411209847');",
      },
      {
        type: "application/ld+json",

        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://certidaodeobjetoepe.org/#organization",
              name: "Certidão Objeto e Pé",
              url: "https://certidaodeobjetoepe.org/",
              description:
                "Assessoria especializada na solicitação de Certidão de Objeto e Pé em tribunais estaduais, federais e trabalhistas de todo o Brasil.",
              areaServed: { "@type": "Country", name: "Brasil" },
              sameAs: [
                "https://youtube.com/@certidaodeobjetoepe",
                "https://www.instagram.com/certidaodeobjetoe",
                "https://www.facebook.com/certidaoobjetoepe",
                "https://share.google/Nw44tGEnb6HR84jZN",
                "https://www.tiktok.com/@certidodeobjetoepe",
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+55-800-000-4604",
                  contactType: "customer service",
                  availableLanguage: ["Portuguese"],
                  areaServed: "BR",
                },
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://certidaodeobjetoepe.org/#website",
              url: "https://certidaodeobjetoepe.org/",
              name: "Certidão Objeto e Pé",
              inLanguage: "pt-BR",
              publisher: { "@id": "https://certidaodeobjetoepe.org/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Analytics() {
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = router.subscribe("onResolved", () => {
      if (typeof window !== "undefined" && "gtag" in window) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
          "event",
          "page_view",
          { page_path: window.location.pathname }
        );
      }
    });
    return () => unsubscribe();
  }, [router]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Analytics />
    </QueryClientProvider>
  );
}
