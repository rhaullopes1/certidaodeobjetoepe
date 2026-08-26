import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Scale, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acesso da equipe | Certidão Objeto e Pé" },
      {
        name: "description",
        content: "Área restrita para a equipe acompanhar e atualizar os pedidos de certidão.",
      },
      { property: "og:title", content: "Acesso da equipe | Certidão Objeto e Pé" },
      { property: "og:description", content: "Área restrita do painel administrativo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function entrarComGoogle() {
    setErro(null);
    setAviso(null);
    setCarregandoGoogle(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setErro(
          result.error instanceof Error
            ? result.error.message
            : "Não foi possível entrar com o Google.",
        );
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar com o Google.");
    } finally {
      setCarregandoGoogle(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    setAviso(null);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin", replace: true });
        else setAviso("Conta criada. Confirme o e-mail para acessar o painel.");
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-secondary/40 px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>

        <div className="card-premium p-7 sm:p-9">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Scale className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Painel da equipe</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso restrito para acompanhar pedidos, anexar comprovantes e atualizar o andamento
            até a emissão da certidão.
          </p>

          <form onSubmit={enviar} className="mt-7 space-y-4">
            <button
              type="button"
              onClick={entrarComGoogle}
              disabled={carregandoGoogle || carregando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              {carregandoGoogle ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.83Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.08 7.94-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.11A12 12 0 0 0 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.28a12 12 0 0 0 0 10.8l4-3.11Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.6l4 3.11C6.23 6.86 8.88 4.75 12 4.75Z"
                  />
                </svg>
              )}
              Entrar com Google
            </button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              ou use seu e-mail
              <span className="h-px flex-1 bg-border" />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-ring"
                placeholder="voce@empresa.com.br"
              />
            </div>
            <div>
              <label htmlFor="senha" className="text-sm font-semibold">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-ring"
                placeholder="••••••••"
              />
            </div>

            {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
            {aviso && <p className="text-sm font-medium text-accent">{aviso}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {carregando && <Loader2 className="h-4 w-4 animate-spin" />}
              {modo === "entrar" ? "Entrar no painel" : "Criar acesso"}
            </button>
          </form>

          <button
            onClick={() => {
              setModo(modo === "entrar" ? "criar" : "entrar");
              setErro(null);
              setAviso(null);
            }}
            className="mt-5 w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {modo === "entrar"
              ? "Ainda não tem acesso? Criar conta da equipe"
              : "Já tenho acesso — entrar"}
          </button>
        </div>
      </div>
    </main>
  );
}
