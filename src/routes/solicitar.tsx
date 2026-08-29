import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, Scale } from "lucide-react";
import { TABELA_PRECOS, formatarBRL, precoCentavos } from "@/lib/site";
import {
  pedidoSchema,
  etapaProcessoSchema,
  certidaoSchema,
  cpfValido,
  soDigitos,
  type EtapaProcessoInput,
} from "@/lib/pedidos.schema";
import { criarPedido } from "@/lib/pedidos.functions";
import { trackBeginCheckout } from "@/lib/analytics";

export const Route = createFileRoute("/solicitar")({
  component: Solicitar,
  head: () => ({
    meta: [
      { title: "Solicitar Certidão de Objeto e Pé | Pedido Online" },
      {
        name: "description",
        content:
          "Informe o número do processo, o nome e o CPF da parte envolvida e receba o valor da sua Certidão de Objeto e Pé para pagamento por Pix.",
      },
      { property: "og:title", content: "Solicitar Certidão de Objeto e Pé Online" },
      {
        property: "og:description",
        content:
          "Pedido online em poucos minutos: dados do processo, protocolo automático e pagamento por Pix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://certidaodeobjetoepe.org/solicitar" },
    ],
    links: [{ rel: "canonical", href: "https://certidaodeobjetoepe.org/solicitar" }],
  }),
});

const inputClass =
  "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring";

function Campo({
  label,
  hint,
  children,
  erro,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  erro?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="ml-2 text-xs text-muted-foreground">{hint}</span>}
      {children}
      {erro && <span className="mt-1 block text-xs font-medium text-destructive">{erro}</span>}
    </label>
  );
}

const QUANTIDADES = Object.keys(TABELA_PRECOS).map(Number);

const CERTIDAO_VAZIA: EtapaProcessoInput = { numeroProcesso: "", nomeParte: "", cpf: "" };

function mascararCPF(valor: string) {
  const d = soDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** Máscara CNJ: 0000000-00.0000.0.00.0000 */
function mascararProcesso(valor: string) {
  const d = soDigitos(valor).slice(0, 20);
  let out = d.slice(0, 7);
  if (d.length > 7) out += `-${d.slice(7, 9)}`;
  if (d.length > 9) out += `.${d.slice(9, 13)}`;
  if (d.length > 13) out += `.${d.slice(13, 14)}`;
  if (d.length > 14) out += `.${d.slice(14, 16)}`;
  if (d.length > 16) out += `.${d.slice(16, 20)}`;
  return out;
}

/** Validação por campo, usada em tempo real enquanto o cliente digita. */
function validarCampo(campo: keyof EtapaProcessoInput, valor: string): string | undefined {
  const v = valor.trim();
  if (campo === "cpf") {
    const digitos = soDigitos(v);
    if (!digitos) return "Informe o CPF da parte envolvida";
    if (digitos.length < 11) return "CPF incompleto (11 dígitos)";
    if (!cpfValido(digitos)) return "CPF inválido — confira os dígitos";
    return undefined;
  }
  if (campo === "numeroProcesso") {
    if (!v) return "Informe o número do processo";
    if (v.length < 10) return "Número do processo incompleto";
    return undefined;
  }
  if (!v) return "Informe o nome completo da parte envolvida";
  if (v.split(/\s+/).length < 2) return "Informe o nome completo (nome e sobrenome)";
  if (v.length < 5) return "Nome muito curto";
  return undefined;
}

function certidaoCompleta(c: EtapaProcessoInput) {
  return (
    !validarCampo("numeroProcesso", c.numeroProcesso) &&
    !validarCampo("nomeParte", c.nomeParte) &&
    !validarCampo("cpf", c.cpf)
  );
}

function Solicitar() {
  const navigate = useNavigate();
  const enviarPedido = useServerFn(criarPedido);
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [processo, setProcesso] = useState<EtapaProcessoInput>(CERTIDAO_VAZIA);
  const [quantidade, setQuantidade] = useState(1);
  const [extras, setExtras] = useState<EtapaProcessoInput[]>([]);
  const [sessaoEmail, setSessaoEmail] = useState<string | null>(null);
  const [modoLogin, setModoLogin] = useState(false);

  useEffect(() => {
    trackBeginCheckout();
  }, []);


  useEffect(() => {
    let ativo = true;
    supabase.auth.getUser().then(({ data }) => {
      if (ativo) setSessaoEmail(data.user?.email ?? null);
    });
    return () => {
      ativo = false;
    };
  }, []);
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  function alterarQuantidade(q: number) {
    setQuantidade(q);
    setExtras((atual) => {
      const alvo = q - 1;
      const proximo = atual.slice(0, alvo);
      while (proximo.length < alvo) {
        proximo.push({ ...CERTIDAO_VAZIA });
      }
      return proximo;
    });
  }

  function formatarCampo(campo: keyof EtapaProcessoInput, valor: string) {
    if (campo === "cpf") return mascararCPF(valor);
    if (campo === "numeroProcesso") return mascararProcesso(valor);
    return valor;
  }

  function atualizarPrincipal(campo: keyof EtapaProcessoInput, valor: string) {
    setProcesso((atual) => ({ ...atual, [campo]: formatarCampo(campo, valor) }));
  }

  function atualizarExtra(i: number, campo: keyof EtapaProcessoInput, valor: string) {
    setExtras((atual) =>
      atual.map((c, idx) => (idx === i ? { ...c, [campo]: formatarCampo(campo, valor) } : c)),
    );
  }

  function marcarTocado(chave: string) {
    setTocados((atual) => ({ ...atual, [chave]: true }));
  }

  /** Mostra o erro assim que o campo é tocado (ou após tentativa de envio). */
  function erroVisivel(chave: string, campo: keyof EtapaProcessoInput, valor: string) {
    if (!tocados[chave]) return undefined;
    return validarCampo(campo, valor);
  }

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const principalValido = certidaoCompleta(processo);
  const extrasValidos = extras.every(certidaoCompleta);

  /** Resumo do que falta preencher, exibido quando o envio está bloqueado. */
  const pendencias: string[] = [];
  extras.forEach((c, i) => {
    if (certidaoCompleta(c)) return;
    const faltando: string[] = [];
    if (validarCampo("numeroProcesso", c.numeroProcesso)) faltando.push("número do processo");
    if (validarCampo("nomeParte", c.nomeParte)) faltando.push("nome completo");
    if (validarCampo("cpf", c.cpf)) faltando.push("CPF válido");
    pendencias.push(`Certidão ${i + 2}: ${faltando.join(", ")}`);
  });
  const algumExtraTocado = extras.some((_, i) =>
    ["numeroProcesso", "nomeParte", "cpf"].some((campo) => tocados[`e-${i}-${campo}`]),
  );

  function coletarErros(issues: { path: PropertyKey[]; message: string }[]) {
    const novos: Record<string, string> = {};
    for (const issue of issues) {
      const campo = String(issue.path[0]);
      if (!novos[campo]) novos[campo] = issue.message;
    }
    return novos;
  }

  function avancar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTocados((atual) => ({
      ...atual,
      "p-numeroProcesso": true,
      "p-nomeParte": true,
      "p-cpf": true,
    }));
    const parsed = etapaProcessoSchema.safeParse(processo);
    if (!parsed.success || !principalValido) {
      if (!parsed.success) setErros(coletarErros(parsed.error.issues));
      return;
    }
    setErros({});
    setProcesso(parsed.data);
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finalizar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTocados((atual) => {
      const novo = { ...atual };
      extras.forEach((_, i) => {
        novo[`e-${i}-numeroProcesso`] = true;
        novo[`e-${i}-nomeParte`] = true;
        novo[`e-${i}-cpf`] = true;
      });
      return novo;
    });
    if (!principalValido || !extrasValidos) {
      setErroGeral("Confira os dados de cada certidão antes de enviar.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const total = precoCentavos(quantidade);
    const listaCertidoes = [processo, ...extras];
    const bruto = {
      ...processo,
      certidoes: listaCertidoes,
      quantidade,
      valorTotalCentavos: total,
      email: String(form.get("email") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      observacoes: String(form.get("observacoes") ?? ""),
    };
    const confirmaEmail = String(form.get("confirmaEmail") ?? "").trim().toLowerCase();
    const contaNome = String(form.get("contaNome") ?? "").trim();
    const senha = String(form.get("senha") ?? "");
    const confirmaSenha = String(form.get("confirmaSenha") ?? "");

    const parsed = pedidoSchema.safeParse(bruto);
    const novosErros = parsed.success ? {} : coletarErros(parsed.error.issues);
    if (confirmaEmail !== bruto.email.trim().toLowerCase()) {
      novosErros.confirmaEmail = "Os e-mails não conferem.";
    }
    extras.forEach((c, i) => {
      const r = certidaoSchema.safeParse(c);
      if (!r.success) {
        for (const issue of r.error.issues) {
          const chave = `extra-${i}-${String(issue.path[0])}`;
          if (!novosErros[chave]) novosErros[chave] = issue.message;
        }
      }
    });
    if (!QUANTIDADES.includes(quantidade) || total !== precoCentavos(quantidade)) {
      novosErros.valorTotalCentavos =
        "O valor não corresponde à quantidade selecionada. Escolha a quantidade novamente.";
    }
    if (!sessaoEmail) {
      if (!modoLogin && contaNome.split(/\s+/).filter(Boolean).length < 2) {
        novosErros.contaNome = "Informe seu nome completo.";
      }
      if (senha.length < 8) novosErros.senha = "A senha precisa ter ao menos 8 caracteres.";
      if (!modoLogin && senha !== confirmaSenha) {
        novosErros.confirmaSenha = "As senhas não conferem.";
      }
    }
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      setErroGeral(null);
      return;
    }

    setErros({});
    setErroGeral(null);
    setEnviando(true);
    try {
      if (!sessaoEmail) {
        const email = bruto.email.trim();
        if (modoLogin) {
          const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
          if (error) {
            setErros({ senha: "E-mail ou senha incorretos." });
            setEnviando(false);
            return;
          }
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password: senha,
            options: { data: { full_name: contaNome } },
          });
          if (error) {
            const msg = error.message || "";
            const jaExiste = /registered|already|exists/i.test(msg);
            if (jaExiste) {
              const entrar = await supabase.auth.signInWithPassword({ email, password: senha });
              if (entrar.error) {
                setModoLogin(true);
                setErros({ senha: "Já existe conta com este e-mail. Informe sua senha para entrar." });
                setEnviando(false);
                return;
              }
            } else if (/weak|pwned|compromised/i.test(msg)) {
              setErros({
                senha:
                  "Essa senha é muito comum e apareceu em vazamentos. Escolha outra, com letras, números e símbolos.",
              });
              setEnviando(false);
              return;
            } else if (/rate limit|too many/i.test(msg)) {
              setErroGeral(
                "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
              );
              setEnviando(false);
              return;
            } else if (/invalid.*email|email address.*invalid/i.test(msg)) {
              setErros({ email: "E-mail inválido. Confira o endereço informado." });
              setEnviando(false);
              return;
            } else {
              setErroGeral(`Não foi possível criar sua conta: ${msg}`);
              setEnviando(false);
              return;
            }
          }
        }

        setSessaoEmail(email);
      }
      const pedido = await enviarPedido({ data: parsed.data! });
      navigate({ to: "/pedido/$protocolo", params: { protocolo: pedido.protocolo } });
    } catch (error) {
      console.error(error);
      setErroGeral("Não foi possível registrar seu pedido agora. Tente novamente em instantes.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-dvh bg-secondary/40">
      <header className="surface-navy">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-foreground/15">
              <Scale className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-sm font-bold">Certidão Objeto e Pé</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Etapa {etapa} de 2
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
          Solicitar Certidão de Objeto e Pé
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {etapa === 1
            ? "Informe os dados do processo e da parte envolvida. Na próxima etapa mostramos o valor da certidão."
            : "Escolha a quantidade de certidões, confira o valor e informe seus contatos para receber o documento."}
        </p>

        {etapa === 1 ? (
          <form onSubmit={avancar} className="card-premium mt-10 space-y-6 p-6 sm:p-8">
            <Campo
              label="Número do processo"
              erro={
                erroVisivel("p-numeroProcesso", "numeroProcesso", processo.numeroProcesso) ??
                erros.numeroProcesso
              }
            >
              <input
                id="processo-numero"
                name="numeroProcesso"
                autoComplete="off"
                inputMode="numeric"
                value={processo.numeroProcesso}
                onChange={(e) => atualizarPrincipal("numeroProcesso", e.target.value)}
                onBlur={() => marcarTocado("p-numeroProcesso")}
                className={inputClass}
                placeholder="0000000-00.0000.0.00.0000"
                maxLength={40}
                required
              />
            </Campo>

            <Campo
              label="Nome completo da parte envolvida"
              erro={erroVisivel("p-nomeParte", "nomeParte", processo.nomeParte) ?? erros.nomeParte}
            >
              <input
                id="processo-nome"
                name="nomeParte"
                autoComplete="name"
                value={processo.nomeParte}
                onChange={(e) => atualizarPrincipal("nomeParte", e.target.value)}
                onBlur={() => marcarTocado("p-nomeParte")}
                className={inputClass}
                placeholder="Ex: Maria Aparecida da Silva"
                maxLength={120}
                required
              />
            </Campo>

            <Campo
              label="CPF da parte envolvida"
              hint="somente números"
              erro={erroVisivel("p-cpf", "cpf", processo.cpf) ?? erros.cpf}
            >
              <input
                id="processo-cpf"
                name="cpf"
                autoComplete="off"
                value={processo.cpf}
                onChange={(e) => {
                  atualizarPrincipal("cpf", e.target.value);
                  if (soDigitos(e.target.value).length === 11) marcarTocado("p-cpf");
                }}
                onBlur={() => marcarTocado("p-cpf")}
                inputMode="numeric"
                className={inputClass}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </Campo>

            <button
              type="submit"
              disabled={!principalValido}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Avançar
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Seus dados são usados apenas para a solicitação da certidão junto ao tribunal.
            </p>
          </form>
        ) : (
          <form onSubmit={finalizar} className="card-premium mt-10 space-y-6 p-6 sm:p-8">
            <div className="rounded-2xl bg-secondary px-5 py-4 text-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Processo</p>
              <p className="mt-1 font-semibold">{processo?.numeroProcesso}</p>
              <p className="text-muted-foreground">
                {processo?.nomeParte} — CPF {processo?.cpf}
              </p>
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className="mt-2 text-xs font-semibold text-primary underline underline-offset-4"
              >
                Editar dados do processo
              </button>
            </div>

            <div>
              <span className="text-sm font-semibold">Quantidade de certidões</span>
              <div className="mt-3 grid gap-3 sm:grid-cols-5">
                {QUANTIDADES.map((q) => {
                  const ativo = q === quantidade;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => alterarQuantidade(q)}
                      className={`rounded-2xl border px-3 py-4 text-center transition-colors ${
                        ativo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-card hover:bg-secondary"
                      }`}
                    >
                      <span className="block font-display text-lg font-bold">{q}</span>
                      <span className="mt-1 block text-xs font-semibold">
                        {formatarBRL(precoCentavos(q))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Valor total
                </p>
                <p className="font-display text-2xl font-bold">
                  {formatarBRL(precoCentavos(quantidade))}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quantidade} {quantidade === 1 ? "certidão" : "certidões"} ·{" "}
                  {formatarBRL(precoCentavos(quantidade))}
                </p>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Pagamento via Pix após a confirmação do pedido
              </p>
            </div>

            {extras.length > 0 && (
              <div className="space-y-5">
                <p className="text-sm font-semibold">
                  Dados das demais certidões
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    cada certidão exige processo, nome e CPF próprios
                  </span>
                </p>
                {extras.map((c, i) => (
                  <div key={i} className="space-y-4 rounded-2xl border border-input bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Certidão {i + 2}
                    </p>
                    <Campo
                      label="Número do processo"
                      erro={
                        erroVisivel(`e-${i}-numeroProcesso`, "numeroProcesso", c.numeroProcesso) ??
                        erros[`extra-${i}-numeroProcesso`]
                      }
                    >
                      <input
                        id={`certidao-${i + 2}-processo`}
                        name={`certidoes[${i + 1}].numeroProcesso`}
                        autoComplete="off"
                        inputMode="numeric"
                        value={c.numeroProcesso}
                        onChange={(e) => atualizarExtra(i, "numeroProcesso", e.target.value)}
                        onBlur={() => marcarTocado(`e-${i}-numeroProcesso`)}
                        className={inputClass}
                        placeholder="0000000-00.0000.0.00.0000"
                        maxLength={40}
                        required
                      />
                    </Campo>
                    <Campo
                      label="Nome completo da parte envolvida"
                      erro={
                        erroVisivel(`e-${i}-nomeParte`, "nomeParte", c.nomeParte) ??
                        erros[`extra-${i}-nomeParte`]
                      }
                    >
                      <input
                        id={`certidao-${i + 2}-nome`}
                        name={`certidoes[${i + 1}].nomeParte`}
                        autoComplete="off"
                        value={c.nomeParte}
                        onChange={(e) => atualizarExtra(i, "nomeParte", e.target.value)}
                        onBlur={() => marcarTocado(`e-${i}-nomeParte`)}
                        className={inputClass}
                        placeholder="Ex: Maria Aparecida da Silva"
                        maxLength={120}
                        required
                      />
                    </Campo>
                    <Campo
                      label="CPF da parte envolvida"
                      hint="somente números"
                      erro={erroVisivel(`e-${i}-cpf`, "cpf", c.cpf) ?? erros[`extra-${i}-cpf`]}
                    >
                      <input
                        id={`certidao-${i + 2}-cpf`}
                        name={`certidoes[${i + 1}].cpf`}
                        autoComplete="off"
                        value={c.cpf}
                        onChange={(e) => {
                          atualizarExtra(i, "cpf", e.target.value);
                          if (soDigitos(e.target.value).length === 11) marcarTocado(`e-${i}-cpf`);
                        }}
                        onBlur={() => marcarTocado(`e-${i}-cpf`)}
                        inputMode="numeric"
                        className={inputClass}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </Campo>
                  </div>
                ))}
              </div>
            )}

            {erros.valorTotalCentavos && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {erros.valorTotalCentavos}
              </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <Campo label="E-mail" erro={erros.email}>
                <input
                  name="email"
                  type="email"
                  className={inputClass}
                  placeholder="seu@email.com"
                  maxLength={255}
                  defaultValue={sessaoEmail ?? ""}
                  readOnly={Boolean(sessaoEmail)}
                  required
                />
              </Campo>
              <Campo label="Confirme o e-mail" erro={erros.confirmaEmail}>
                <input
                  name="confirmaEmail"
                  type="email"
                  className={inputClass}
                  placeholder="repita o e-mail"
                  maxLength={255}
                  onPaste={(e) => e.preventDefault()}
                  defaultValue={sessaoEmail ?? ""}
                  readOnly={Boolean(sessaoEmail)}
                  required
                />
              </Campo>
            </div>

            {sessaoEmail ? (
              <p className="rounded-2xl bg-secondary px-5 py-4 text-sm text-muted-foreground">
                Pedido vinculado à sua conta <strong className="text-foreground">{sessaoEmail}</strong>.
                Você poderá acompanhar tudo em “Meus pedidos”.
              </p>
            ) : (
              <div className="space-y-5 rounded-2xl border border-input bg-card p-5">
                <div>
                  <p className="text-sm font-bold">
                    {modoLogin ? "Entrar na sua conta" : "Criar sua conta"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    A conta dá acesso ao histórico de pedidos, QR Code e código Pix a qualquer momento.
                  </p>
                </div>

                {!modoLogin && (
                  <Campo label="Nome completo" erro={erros.contaNome}>
                    <input
                      name="contaNome"
                      autoComplete="name"
                      className={inputClass}
                      placeholder="Seu nome completo"
                      maxLength={120}
                    />
                  </Campo>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <Campo label="Senha" hint="mín. 8 caracteres" erro={erros.senha}>
                    <input
                      name="senha"
                      type="password"
                      autoComplete={modoLogin ? "current-password" : "new-password"}
                      className={inputClass}
                      placeholder="••••••••"
                      minLength={8}
                      maxLength={72}
                      required
                    />
                  </Campo>
                  {!modoLogin && (
                    <Campo label="Confirme a senha" erro={erros.confirmaSenha}>
                      <input
                        name="confirmaSenha"
                        type="password"
                        autoComplete="new-password"
                        className={inputClass}
                        placeholder="••••••••"
                        minLength={8}
                        maxLength={72}
                        required
                      />
                    </Campo>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setModoLogin((v) => !v)}
                  className="text-xs font-semibold text-primary underline underline-offset-4"
                >
                  {modoLogin ? "Ainda não tenho conta — quero cadastrar" : "Já tenho conta — quero entrar"}
                </button>
              </div>
            )}


            <Campo label="WhatsApp" hint="com DDD" erro={erros.whatsapp}>
              <input
                name="whatsapp"
                inputMode="tel"
                className={inputClass}
                placeholder="(47) 90000-0000"
                maxLength={20}
                required
              />
            </Campo>

            <Campo label="Observações" hint="opcional" erro={erros.observacoes}>
              <textarea
                name="observacoes"
                rows={3}
                maxLength={1000}
                className={inputClass}
              />
            </Campo>

            {!extrasValidos && algumExtraTocado && pendencias.length > 0 && (
              <div
                role="alert"
                className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <p className="font-semibold">Para concluir o pedido, corrija:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {pendencias.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {erroGeral && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {erroGeral}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando || !principalValido || !extrasValidos}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {enviando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando protocolo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Gerar pedido e pagar com Pix
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
