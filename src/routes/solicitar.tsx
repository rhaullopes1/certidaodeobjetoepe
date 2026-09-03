import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Send,
  MessageCircle,
} from "lucide-react";
import { QUANTIDADE_MAXIMA, precoCentavos, whatsappLink } from "@/lib/site";

import { cpfValido, soDigitos, pedidoSchema } from "@/lib/pedidos.schema";
import { criarPedido } from "@/lib/pedidos.functions";
import { decodificarProcesso, type ProcessoDecodificado } from "@/lib/cnj.functions";
import { trackBeginCheckout } from "@/lib/analytics";
import { SiteHeader } from "@/components/site/site-header";

export const Route = createFileRoute("/solicitar")({
  component: Solicitar,
  head: () => ({
    meta: [
      { title: "Solicitar Certidão de Objeto e Pé | Pedido Online" },
      {
        name: "description",
        content:
          "Informe o número de um ou mais processos, os dados de quem está no processo e envie seu pedido de Certidão de Objeto e Pé em poucos minutos.",
      },
      { property: "og:title", content: "Solicitar Certidão de Objeto e Pé Online" },
      {
        property: "og:description",
        content:
          "Pedido online em poucos minutos: vários processos no mesmo pedido, reconhecimento automático do tribunal e protocolo na hora.",
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

type Bloco = { numeroProcesso: string; nomeParte: string; observacoes: string };

const BLOCO_VAZIO: Bloco = { numeroProcesso: "", nomeParte: "", observacoes: "" };

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

function mascararWhatsapp(valor: string) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function nomeOk(v: string) {
  const t = v.trim();
  return t.length >= 5 && t.split(/\s+/).filter(Boolean).length >= 2;
}

function processoOk(v: string) {
  const d = soDigitos(v);
  return d.length >= 10 && d.length <= 25;
}

function blocoCompleto(b: Bloco) {
  return processoOk(b.numeroProcesso) && nomeOk(b.nomeParte);
}

/** Pílulas discretas com o que o número único revela sobre o processo. */
function Pilulas({ dados, carregando }: { dados: ProcessoDecodificado | null; carregando: boolean }) {
  if (carregando) {
    return (
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Identificando o processo...
      </p>
    );
  }
  if (!dados) return null;

  const tags: string[] = [];
  if (dados.tribunalSigla) tags.push(dados.tribunalSigla);
  if (dados.segmentoNome) tags.push(dados.segmentoNome);
  if (dados.uf) tags.push(dados.uf);
  if (dados.cidade) tags.push(dados.cidade);
  if (dados.comarca) tags.push(dados.comarca);
  if (dados.ano) tags.push(String(dados.ano));

  return (
    <div className="mt-3" aria-live="polite">
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
      {dados.mensagem && (
        <p className="mt-2 text-xs text-muted-foreground">{dados.mensagem}</p>
      )}
      {!dados.reconhecido && tags.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Não reconhecemos esse número automaticamente — pode seguir mesmo assim, nossa equipe
          confere para você.
        </p>
      )}
    </div>
  );
}

/** Bloco de um processo: número, dados reconhecidos, parte e observação própria. */
function BlocoProcesso({
  indice,
  valor,
  onChange,
  onRemover,
  mostrarErros,
}: {
  indice: number;
  valor: Bloco;
  onChange: (b: Bloco) => void;
  onRemover?: () => void;
  mostrarErros: boolean;
}) {
  const decodificar = useServerFn(decodificarProcesso);
  const [dados, setDados] = useState<ProcessoDecodificado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const digitos = soDigitos(valor.numeroProcesso);

  useEffect(() => {
    if (digitos.length !== 20) {
      setDados(null);
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    const t = setTimeout(() => {
      decodificar({ data: { numero: digitos } })
        .then((r) => ativo && setDados(r))
        .catch(() => ativo && setDados(null))
        .finally(() => ativo && setCarregando(false));
    }, 350);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
  }, [digitos, decodificar]);

  const erroProcesso =
    mostrarErros && !processoOk(valor.numeroProcesso) ? "Informe o número do processo" : undefined;
  const erroNome =
    mostrarErros && !nomeOk(valor.nomeParte)
      ? "Informe o nome completo de quem está no processo"
      : undefined;

  return (
    <div className="relative rounded-2xl border border-input bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Processo {indice + 1}
        </p>
        {onRemover && (
          <button
            type="button"
            onClick={onRemover}
            aria-label={`Remover processo ${indice + 1}`}
            className="-mt-1 -mr-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-5">
        <Campo label="Número do processo" erro={erroProcesso}>
          <input
            id={`processo-${indice}`}
            autoComplete="off"
            inputMode="numeric"
            value={valor.numeroProcesso}
            onChange={(e) =>
              onChange({ ...valor, numeroProcesso: mascararProcesso(e.target.value) })
            }
            className={inputClass}
            placeholder="0000000-00.0000.0.00.0000"
            maxLength={40}
            required
          />
        </Campo>

        <Pilulas dados={dados} carregando={carregando} />

        <Campo label="Nome de quem está no processo" erro={erroNome}>
          <input
            autoComplete="off"
            value={valor.nomeParte}
            onChange={(e) => onChange({ ...valor, nomeParte: e.target.value })}
            className={inputClass}
            placeholder="Ex: Maria Aparecida da Silva"
            maxLength={120}
            required
          />
        </Campo>

        <Campo label="Observações deste processo" hint="opcional">
          <textarea
            rows={3}
            maxLength={1000}
            value={valor.observacoes}
            onChange={(e) => onChange({ ...valor, observacoes: e.target.value })}
            className={inputClass}
            placeholder="Observações para este processo (ex: solicitar denúncia do Ministério Público, certidão de inteiro teor, etc.)"
          />
        </Campo>
      </div>
    </div>
  );
}

function Solicitar() {
  const navigate = useNavigate();
  const enviarPedido = useServerFn(criarPedido);

  const [processos, setProcessos] = useState<Bloco[]>([{ ...BLOCO_VAZIO }]);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sessaoEmail, setSessaoEmail] = useState<string | null>(null);

  const [mostrarErros, setMostrarErros] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Antes da hidratação um clique dispara o envio nativo do formulário e recarrega a página.
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setPronto(true);
    trackBeginCheckout();
  }, []);


  useEffect(() => {
    let ativo = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!ativo) return;
      const u = data.user;
      if (!u) return;
      setSessaoEmail(u.email ?? null);
      setEmail(u.email ?? "");
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      if (typeof meta['full_name'] === "string") setNome(meta['full_name']);
    });
    return () => {
      ativo = false;
    };
  }, []);

  function atualizarBloco(i: number, b: Bloco) {
    setProcessos((atual) => atual.map((p, idx) => (idx === i ? b : p)));
  }

  function adicionarBloco() {
    setProcessos((atual) =>
      atual.length >= QUANTIDADE_MAXIMA ? atual : [...atual, { ...BLOCO_VAZIO }],
    );
  }

  function removerBloco(i: number) {
    setProcessos((atual) => atual.filter((_, idx) => idx !== i));
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMostrarErros(true);
    setErroGeral(null);

    const novosErros: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros['email'] = "Informe um e-mail válido.";
    }
    if (!nomeOk(nome)) novosErros['nome'] = "Informe seu nome completo.";
    if (!cpfValido(cpf)) novosErros['cpf'] = "CPF inválido — confira os dígitos.";
    const wa = soDigitos(whatsapp);
    if (wa.length < 10) novosErros['whatsapp'] = "Informe o WhatsApp com DDD.";
    if (!processos.every(blocoCompleto)) {
      novosErros['processos'] = "Confira o número e o nome da parte em cada processo.";
    }
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const cpfDigitos = soDigitos(cpf);
    const certidoes = processos.map((p) => ({
      numeroProcesso: p.numeroProcesso.trim(),
      nomeParte: p.nomeParte.trim(),
      cpf: cpfDigitos,
      observacoes: p.observacoes.trim(),
    }));
    const bruto = {
      numeroProcesso: certidoes[0]!.numeroProcesso,
      nomeParte: certidoes[0]!.nomeParte,
      cpf: cpfDigitos,
      certidoes,
      quantidade: certidoes.length,
      valorTotalCentavos: precoCentavos(certidoes.length),
      email: email.trim(),
      whatsapp: wa,
      observacoes: "",
    };

    const parsed = pedidoSchema.safeParse(bruto);
    if (!parsed.success) {
      const mapa: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const campo = String(issue.path[0]);
        if (!mapa[campo]) mapa[campo] = issue.message;
      }
      setErros(mapa);
      setErroGeral("Confira os dados destacados antes de enviar.");
      return;
    }

    setErros({});
    setEnviando(true);
    try {
      const pedido = await enviarPedido({ data: parsed.data });

      // Conta criada em segundo plano, sem senha: o cliente recebe um link de acesso.
      if (!sessaoEmail) {
        try {
          await supabase.auth.signInWithOtp({
            email: bruto.email,
            options: {
              shouldCreateUser: true,
              emailRedirectTo: `${window.location.origin}/minha-conta`,
              data: { full_name: nome.trim(), cpf: cpfDigitos, whatsapp: wa },
            },
          });
        } catch {
          // O pedido já existe: falha no e-mail de acesso não bloqueia o cliente.
        }
      }

      navigate({ to: "/pedido/$protocolo", params: { protocolo: pedido.protocolo } });
    } catch (error) {
      console.error(error);
      setErroGeral("Não foi possível registrar seu pedido agora. Tente novamente em instantes.");
      setEnviando(false);
    }
  }

  const podeAdicionar = processos.length < QUANTIDADE_MAXIMA;

  return (
    <div className="min-h-dvh bg-secondary/40">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Solicitação em uma única tela
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
          Solicitar Certidão de Objeto e Pé
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Informe o número de cada processo — identificamos o tribunal automaticamente. Você pode
          incluir quantos processos precisar no mesmo pedido e ver o resumo completo na tela
          seguinte.
        </p>

        <a
          href={whatsappLink(
            "Olá! Não sei o número completo do processo. Podem me ajudar a identificar?",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors hover:bg-secondary/60"
        >
          <MessageCircle className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <p className="min-w-0 font-semibold">
            Não sabe o número completo do processo? Fale com a nossa equipe no
            WhatsApp que ajudamos você a identificar agora mesmo.
            <span className="ml-1 font-bold text-primary underline underline-offset-4">
              Falar com Especialista
            </span>
          </p>
        </a>

        <form
          onSubmit={enviar}
          action="#"
          method="post"
          className="mt-8 space-y-6"
          noValidate
        >
          <div className="space-y-5">
            {processos.map((p, i) => (
              <BlocoProcesso
                key={i}
                indice={i}
                valor={p}
                onChange={(b) => atualizarBloco(i, b)}
                onRemover={processos.length > 1 ? () => removerBloco(i) : undefined}
                mostrarErros={mostrarErros}
              />
            ))}
          </div>

          {podeAdicionar ? (
            <button
              type="button"
              onClick={adicionarBloco}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-card px-5 py-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              <Plus className="h-4 w-4" />
              Adicionar outro processo
            </button>
          ) : (
            <p className="rounded-2xl border border-input bg-card px-5 py-4 text-sm text-muted-foreground">
              Você chegou ao limite de {QUANTIDADE_MAXIMA} processos por pedido.{" "}
              <a
                href={whatsappLink(
                  "Olá! Preciso solicitar certidões para mais processos no mesmo pedido.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Fale com a equipe
              </a>{" "}
              para volumes maiores.
            </p>
          )}

          {erros['processos'] && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {erros['processos']}
            </p>
          )}

          <section className="space-y-5 rounded-2xl border border-input bg-card p-5 sm:p-6">
            <div>
              <h2 className="text-base font-bold">Dados do solicitante</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Usamos apenas para enviar o protocolo, o andamento e a certidão pronta. Sua conta é
                criada automaticamente — você não precisa cadastrar senha.
              </p>
            </div>

            <Campo label="E-mail" erro={erros['email']}>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={Boolean(sessaoEmail)}
                className={inputClass}
                placeholder="seu@email.com"
                maxLength={255}
                required
              />
            </Campo>

            <Campo label="Nome completo" erro={erros['nome']}>
              <input
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputClass}
                placeholder="Seu nome completo"
                maxLength={120}
                required
              />
            </Campo>

            <div className="grid gap-5 sm:grid-cols-2">
              <Campo label="CPF" hint="pode digitar só os números" erro={erros['cpf']}>
                <input
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => setCpf(mascararCPF(e.target.value))}
                  className={inputClass}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </Campo>

              <Campo label="WhatsApp" hint="com DDD" erro={erros['whatsapp']}>
                <input
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))}
                  className={inputClass}
                  placeholder="(47) 90000-0000"
                  maxLength={16}
                  required
                />
              </Campo>
            </div>
          </section>

          {erroGeral && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {erroGeral}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-inset ring-accent/30 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {enviando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Enviando seu pedido...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" /> Solicitar Orçamento e Enviar Pedido
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            Seus dados são usados apenas para pedir a certidão ao tribunal.
          </p>

          <p className="text-center text-xs text-muted-foreground">
            Ficou com dúvida em algum campo?{" "}
            <a
              href={whatsappLink("Olá! Preciso de ajuda para preencher o pedido da certidão.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-4"
            >
              fale com uma pessoa da equipe
            </a>
            .
          </p>
        </form>
      </main>
    </div>
  );
}
