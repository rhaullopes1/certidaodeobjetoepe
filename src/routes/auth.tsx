import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Scale, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

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
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-5 py-12">
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
    </div>
  );
}
