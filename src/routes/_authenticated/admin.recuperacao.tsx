import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, CheckCircle2, XCircle, Send, RefreshCw } from "lucide-react";
import { AdminHeader, SemPermissao } from "./admin.index";
import { souEquipe } from "@/lib/admin";
import {
  painelRecuperacao,
  reenviarRecuperacao,
  marcarPagoRecuperacao,
  cancelarRecuperacaoFn,
  salvarEmailSequencia,
  enviarEmailTeste,
} from "@/lib/recuperacao.functions";

export const Route = createFileRoute("/_authenticated/admin/recuperacao")({
  component: RecuperacaoPage,
  head: () => ({
    meta: [
      { title: "Recuperação de pedidos | Certidão Objeto e Pé" },
      {
        name: "description",
        content: "Automação de e-mails para recuperar pedidos com pagamento pendente.",
      },
      { property: "og:title", content: "Recuperação de pedidos | Certidão Objeto e Pé" },
      { property: "og:description", content: "Painel interno de recuperação de pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ROTULO_STATUS: Record<string, string> = {
  pendente: "Aguardando etapa 1",
  etapa_1_enviada: "Etapa 1 enviada",
  etapa_2_enviada: "Etapa 2 enviada",
  etapa_3_enviada: "Etapa 3 enviada",
  recuperado: "Recuperado",
  cancelado: "Cancelado",
};

const VARIAVEIS = ["{{nome_cliente}}", "{{numero_pedido}}", "{{link_pagamento}}", "{{codigo_pix}}"];

function dataBr(valor: string | null) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function Metrica({ titulo, valor, detalhe }: { titulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-wide text-white/50">{titulo}</p>
      <p className="mt-2 font-display text-3xl font-bold text-white">{valor}</p>
      {detalhe ? <p className="mt-1 text-xs text-white/50">{detalhe}</p> : null}
    </div>
  );
}

function RecuperacaoPage() {
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const carregar = useServerFn(painelRecuperacao);
  const queryClient = useQueryClient();
  const [aba, setAba] = useState<"painel" | "emails">("painel");
  const [filtro, setFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  const painel = useQuery({
    queryKey: ["recuperacao"],
    queryFn: () => carregar({ data: undefined }),
    enabled: permissao.data === true,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["recuperacao"] });

  const reenviar = useServerFn(reenviarRecuperacao);
  const marcarPago = useServerFn(marcarPagoRecuperacao);
  const cancelar = useServerFn(cancelarRecuperacaoFn);

  const acao = useMutation({
    mutationFn: async ({ tipo, id }: { tipo: "reenviar" | "pago" | "cancelar"; id: string }) => {
      if (tipo === "reenviar") return reenviar({ data: { id } });
      if (tipo === "pago") return marcarPago({ data: { id } });
      return cancelar({ data: { id } });
    },
    onSuccess: (_r, v) => {
      setAviso(
        v.tipo === "reenviar"
          ? "E-mail reenviado."
          : v.tipo === "pago"
            ? "Pedido marcado como pago."
            : "Recuperação cancelada.",
      );
      void invalidar();
    },
    onError: (e: unknown) => setAviso(e instanceof Error ? e.message : "Falha na ação."),
  });

  const linhas = useMemo(() => {
    const todas = painel.data?.linhas ?? [];
    const termo = busca.trim().toLowerCase();
    return todas.filter((l) => {
      if (filtro && l.status !== filtro) return false;
      if (!termo) return true;
      return (
        l.protocolo.toLowerCase().includes(termo) ||
        l.clienteEmail.toLowerCase().includes(termo) ||
        (l.clienteNome ?? "").toLowerCase().includes(termo)
      );
    });
  }, [painel.data, filtro, busca]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        {permissao.isPending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando acesso...
          </p>
        )}

        {permissao.data === false && <SemPermissao />}

        {permissao.data === true && (
          <div className="rounded-3xl bg-[#0B1F3A] p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold">Recuperação de pedidos</h1>
                <p className="mt-1 text-sm text-white/60">
                  Sequência automática de 3 e-mails: 30 minutos, 12 horas e 48 horas após o pedido.
                </p>
              </div>
              <button
                onClick={() => void invalidar()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" /> Atualizar
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              {(["painel", "emails"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setAba(v)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    aba === v ? "bg-white text-[#0B1F3A]" : "border border-white/15 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {v === "painel" ? "Painel" : "E-mails"}
                </button>
              ))}
            </div>

            {aviso && (
              <p className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm">
                {aviso}
              </p>
            )}

            {painel.isPending && (
              <p className="mt-8 flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados...
              </p>
            )}

            {painel.data && aba === "painel" && (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Metrica
                    titulo="Pedidos pendentes"
                    valor={String(painel.data.metricas.pendentes)}
                    detalhe={`${painel.data.metricas.emRecuperacao} já receberam e-mail`}
                  />
                  <Metrica
                    titulo="Taxa de recuperação"
                    valor={`${painel.data.metricas.taxaRecuperacao}%`}
                    detalhe={`${painel.data.metricas.recuperados} pedidos recuperados`}
                  />
                  <Metrica
                    titulo="Valor recuperado"
                    valor={painel.data.metricas.valorRecuperadoFormatado}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por protocolo, nome ou e-mail"
                    aria-label="Buscar pedidos em recuperação"
                    className="min-w-[220px] flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40"
                  />
                  <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    aria-label="Filtrar por etapa"
                    className="rounded-xl border border-white/15 bg-[#0B1F3A] px-4 py-2.5 text-sm text-white outline-none focus:border-white/40"
                  >
                    <option value="">Todos os status</option>
                    {Object.entries(ROTULO_STATUS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
                      <tr>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Valor</th>
                        <th className="px-4 py-3">Etapa</th>
                        <th className="px-4 py-3">Criado em</th>
                        <th className="px-4 py-3">Último envio</th>
                        <th className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map((l) => (
                        <tr key={l.id} className="border-t border-white/10 align-top">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{l.clienteNome ?? "—"}</p>
                            <p className="text-xs text-white/60">{l.clienteEmail}</p>
                            <p className="text-xs text-white/40">{l.protocolo}</p>
                          </td>
                          <td className="px-4 py-3">{l.valorFormatado}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs">
                              {ROTULO_STATUS[l.status] ?? l.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/70">{dataBr(l.dataCriacao)}</td>
                          <td className="px-4 py-3 text-white/70">{dataBr(l.ultimoEnvio)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                disabled={acao.isPending}
                                onClick={() => acao.mutate({ tipo: "reenviar", id: l.id })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50"
                              >
                                <Mail className="h-3.5 w-3.5" /> Reenviar
                              </button>
                              <button
                                disabled={acao.isPending || l.status === "recuperado"}
                                onClick={() => acao.mutate({ tipo: "pago", id: l.id })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Marcar pago
                              </button>
                              <button
                                disabled={acao.isPending || l.status === "cancelado"}
                                onClick={() => acao.mutate({ tipo: "cancelar", id: l.id })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 disabled:opacity-50"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!linhas.length && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                            Nenhum pedido em recuperação no momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {painel.data && aba === "emails" && (
              <EditorEmails config={painel.data.config} onSalvo={() => void invalidar()} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

type ConfigEtapa = { etapa: number; assunto: string; corpo: string; ativo: boolean };

function EditorEmails({ config, onSalvo }: { config: ConfigEtapa[]; onSalvo: () => void }) {
  const salvar = useServerFn(salvarEmailSequencia);
  const teste = useServerFn(enviarEmailTeste);
  const [itens, setItens] = useState<ConfigEtapa[]>(config);
  const [ativo, setAtivo] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [emailTeste, setEmailTeste] = useState("");

  useEffect(() => setItens(config), [config]);

  const atual = itens.find((i) => i.etapa === ativo);
  if (!atual) return null;

  const atualizar = (patch: Partial<ConfigEtapa>) =>
    setItens((prev) => prev.map((i) => (i.etapa === ativo ? { ...i, ...patch } : i)));

  const previewVars: Record<string, string> = {
    "{{nome_cliente}}": "Maria",
    "{{numero_pedido}}": "COP2026ABC123",
    "{{link_pagamento}}": "https://certidaodeobjetoepe.org/pedido/COP2026ABC123",
    "{{codigo_pix}}": "00020126580014BR.GOV.BCB.PIX...",
  };
  const preencher = (texto: string) =>
    Object.entries(previewVars).reduce(
      (t, [k, v]) => t.replaceAll(k.replace("{{", "{{").replace("}}", "}}"), v),
      texto,
    );

  const atrasos: Record<number, string> = {
    1: "30 minutos após o pedido",
    2: "12 horas após o pedido",
    3: "48 horas após o pedido",
  };

  async function onSalvar() {
    setStatus("Salvando...");
    try {
      await salvar({
        data: {
          etapa: atual!.etapa as 1 | 2 | 3,
          assunto: atual!.assunto,
          corpo: atual!.corpo,
          ativo: atual!.ativo,
        },
      });
      setStatus("Texto salvo.");
      onSalvo();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  async function onTestar() {
    if (!emailTeste) return setStatus("Informe um e-mail para o teste.");
    setStatus("Enviando teste...");
    try {
      await teste({ data: { etapa: atual!.etapa as 1 | 2 | 3, email: emailTeste } });
      setStatus("E-mail de teste enviado.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Falha ao enviar teste.");
    }
  }

  const campo =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40";

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div>
        <div className="flex gap-2">
          {itens.map((i) => (
            <button
              key={i.etapa}
              onClick={() => setAtivo(i.etapa)}
              className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                ativo === i.etapa ? "bg-white text-[#0B1F3A]" : "border border-white/15 text-white/70 hover:bg-white/10"
              }`}
            >
              Etapa {i.etapa}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/50">Disparo: {atrasos[atual.etapa]}</p>

        <label className="mt-4 block text-xs uppercase tracking-wide text-white/50" htmlFor="assunto">
          Assunto
        </label>
        <input
          id="assunto"
          value={atual.assunto}
          onChange={(e) => atualizar({ assunto: e.target.value })}
          className={`mt-1 ${campo}`}
        />

        <label className="mt-4 block text-xs uppercase tracking-wide text-white/50" htmlFor="corpo">
          Corpo do e-mail
        </label>
        <textarea
          id="corpo"
          rows={12}
          value={atual.corpo}
          onChange={(e) => atualizar({ corpo: e.target.value })}
          className={`mt-1 ${campo} font-mono`}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {VARIAVEIS.map((v) => (
            <button
              key={v}
              onClick={() => atualizar({ corpo: `${atual.corpo}${v}` })}
              className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10"
            >
              {v}
            </button>
          ))}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={atual.ativo}
            onChange={(e) => atualizar({ ativo: e.target.checked })}
          />
          Etapa ativa
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => void onSalvar()}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A]"
          >
            Salvar
          </button>
          <input
            value={emailTeste}
            onChange={(e) => setEmailTeste(e.target.value)}
            placeholder="seu@email.com"
            aria-label="E-mail para teste"
            className={`w-52 ${campo}`}
          />
          <button
            onClick={() => void onTestar()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <Send className="h-4 w-4" /> Enviar teste
          </button>
        </div>
        {status && <p className="mt-3 text-sm text-white/70">{status}</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white p-5 text-[#233047]">
        <p className="text-xs uppercase tracking-wide text-[#B08D3F]">Pré-visualização</p>
        <p className="mt-2 font-display text-lg font-bold text-[#0B1F3A]">
          {preencher(atual.assunto)}
        </p>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-6">{preencher(atual.corpo)}</div>
      </div>
    </div>
  );
}
