import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "" }),
  head: () => ({ meta: [
    { title: "Conectar agente | Certidão de Objeto e Pé" },
    { name: "description", content: "Autorize um agente a consultar pedidos com as permissões da sua conta." },
    { property: "og:title", content: "Conectar agente | Certidão de Objeto e Pé" },
    { property: "og:description", content: "Consentimento seguro para consultar pedidos de certidão." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Solicitação de conexão inválida. Inicie novamente pelo agente.");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Não foi possível verificar sua conta. Tente novamente.");
    if (!data.session) throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr + location.hash } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Solicitação de conexão inválida.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error) throw new Error("Esta autorização expirou ou não pôde ser carregada. Inicie novamente pelo agente.");
    if (data && "redirect_url" in data && data.redirect_url) throw redirect({ href: data.redirect_url });
    const session = await supabase.auth.getSession();
    return { details: data, email: session.data.session?.user.email };
  },
  pendingComponent: () => <main className="mx-auto max-w-lg px-5 py-16">Carregando conexão…</main>,
  errorComponent: ({ error }) => <main className="mx-auto max-w-lg px-5 py-16"><h1 className="text-xl font-bold">Conexão não disponível</h1><p role="alert" className="mt-4 text-muted-foreground">{error instanceof Error ? error.message : "Não foi possível carregar a conexão."}</p></main>,
  component: Consent,
});

function Consent() {
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!details || !("client" in details)) return <main className="mx-auto max-w-lg px-5 py-16">Solicitação inválida. Inicie novamente pelo agente.</main>;
  const name = details.client.name || "Agente";
  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const result = approve ? await supabase.auth.oauth.approveAuthorization(authorization_id) : await supabase.auth.oauth.denyAuthorization(authorization_id);
      if (result.error) throw result.error;
      if (!result.data?.redirect_url) throw new Error("O agente não informou um destino de retorno.");
      window.location.href = result.data.redirect_url;
    } catch {
      setError(approve ? "Não foi possível aprovar. Tente novamente." : "Não foi possível cancelar. Tente novamente.");
      setBusy(false);
    }
  }
  return <main className="mx-auto max-w-lg px-5 py-16 text-foreground">
    <h1 className="font-display text-2xl font-bold">Conectar {name} à Certidão de Objeto e Pé</h1>
    <p className="mt-4 text-sm text-muted-foreground">Conta: {email}</p>
    <p className="mt-4">{name} poderá consultar os pedidos permitidos para sua conta.</p>
    <p className="mt-3 break-all text-sm text-muted-foreground">Destino do agente: {details.redirect_uri}</p>
    <ul className="mt-5 space-y-2 text-sm">{details.scope.split(" ").filter(Boolean).map((scope) => <li key={scope}>{({ openid: "Identificar sua conta", email: "Compartilhar seu e-mail", profile: "Compartilhar seu perfil básico" } as Record<string, string>)[scope] ?? `Permissão adicional solicitada: ${scope}`}</li>)}</ul>
    <p className="mt-5 text-sm text-muted-foreground">Não permite alterar pedidos ou pagamentos. As permissões da sua conta continuam valendo.</p>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    <div className="mt-7 flex flex-wrap gap-3"><Button disabled={busy} onClick={() => decide(true)}>Permitir conexão</Button><Button disabled={busy} variant="outline" onClick={() => decide(false)}>Cancelar conexão</Button></div>
  </main>;
}