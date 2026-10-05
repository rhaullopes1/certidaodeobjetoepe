import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2, MessageCircle, Mail, CheckCircle2 } from "lucide-react";
import { AdminHeader, SemPermissao } from "./admin.index";
import { souEquipe } from "@/lib/admin";
import { formatarBRL } from "@/lib/site";
import { FINALIDADES } from "@/lib/pedidos.schema";
import { normalizarWhatsapp, linkDoPedido } from "@/lib/whatsapp-cliente";
import {
  painelReativacao,
  registrarContatoReativacaoFn,
  dispararEmailsReativacaoFn,
} from "@/lib/reativacao.functions";

export const Route = createFileRoute("/_authenticated/admin/reativacao")({
  component: ReativacaoPage,
  head: () => ({
    meta: [
      { title: "Reativação de pedidos | Certidão Objeto e Pé" },
      { name: "description", content: "Campanha de reativação de pedidos não pagos nos dias 5 e 10." },
      { property: "og:title", content: "Reativação de pedidos | Certidão Objeto e Pé" },
      { property: "og:description", content: "Painel interno de reativação de pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ROTULO: Record<string, string> = {
  cancelado: "Cancelado",
  expirado: "Expirado",
  aguardando_pagamento: "Aguardando pagamento",
};

function mensagem(l: { nome: string | null; protocolo: string; valorCentavos: number }) {
  const nome = l.nome?.trim().split(/\s+/)[0] || "tudo bem";
  return (
    `Olá, ${nome}! Tudo bem? Sou da equipe da Certidão de Objeto e Pé.\n\n` +
    `Vi que você havia solicitado a certidão do seu processo. Como sabemos que nem sempre dá para pagar à vista, ` +
    `agora você pode *parcelar em até 3x de ${formatarBRL(Math.ceil(l.valorCentavos / 3))} no cartão*, ou pagar via Pix.\n\n` +
    `Seu pedido continua salvo, é só abrir o link que ele é reativado com os mesmos dados: ${linkDoPedido(l.protocolo)}\n\n` +
    `Se ainda precisar da certidão para regularizar seu processo/cadastro, é só me responder aqui que eu te ajudo!`
  );
}

function dataBr(v: string | null) {
  return v ? new Date(v).toLocaleDateString("pt-BR") : "—";
}

function mesmoMes(v: string | null) {
  if (!v) return false;
  const d = new Date(v);
  const h = new Date();
  return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear();
}

function ReativacaoPage() {
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const carregar = useServerFn(painelReativacao);
  const registrar = useServerFn(registrarContatoReativacaoFn);
  const disparar = useServerFn(dispararEmailsReativacaoFn);
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<"todos" | "pendentes" | "contatados">("pendentes");
  const [aviso, setAviso] = useState<string | null>(null);

  const lista = useQuery({
    queryKey: ["reativacao"],
    queryFn: () => carregar({ data: undefined }),
    enabled: permissao.data === true,
  });

  const contato = useMutation({
    mutationFn: (id: string) => registrar({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reativacao"] }),
  });

  const emails = useMutation({
    mutationFn: () => disparar({ data: undefined }),
    onSuccess: (r) => {
      setAviso(`E-mails enviados: ${r.enviados}${r.falhas ? ` (falhas: ${r.falhas})` : ""}.`);
      void qc.invalidateQueries({ queryKey: ["reativacao"] });
    },
    onError: (e) => setAviso(e instanceof Error ? e.message : "Falha no envio."),
  });

  const linhas = useMemo(() => {
    const todas = lista.data ?? [];
    if (filtro === "pendentes") return todas.filter((l) => !mesmoMes(l.contatoEm));
    if (filtro === "contatados") return todas.filter((l) => mesmoMes(l.contatoEm));
    return todas;
  }, [lista.data, filtro]);

  const total = lista.data?.length ?? 0;
  const contatadosMes = (lista.data ?? []).filter((l) => mesmoMes(l.contatoEm)).length;
  const potencial = (lista.data ?? []).reduce((s, l) => s + l.valorCentavos, 0);

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
          <>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Reativação (dias 5 e 10)</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Clientes que fizeram o pedido e não pagaram (há mais de 3 dias). Ao abrir o link, o
              mesmo pedido é reativado com Pix novo e cartão em até 3x. Pagou, entra na fila de
              entregas automaticamente. O e-mail sai sozinho nos dias 5 e 10, às 9h30.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Clientes na lista</p>
                <p className="mt-1 font-display text-3xl font-bold">{total}</p>
              </div>
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Chamados no WhatsApp este mês</p>
                <p className="mt-1 font-display text-3xl font-bold">{contatadosMes}</p>
              </div>
              <div className="card-premium p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor parado</p>
                <p className="mt-1 font-display text-3xl font-bold">{formatarBRL(potencial)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {(["pendentes", "contatados", "todos"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold ${filtro === f ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"}`}
                >
                  {f === "pendentes" ? "A chamar este mês" : f === "contatados" ? "Já chamados" : "Todos"}
                </button>
              ))}
              <button
                onClick={() => {
                  if (confirm("Enviar agora o e-mail de reativação para os clientes da lista? (cada cliente recebe no máximo 1 a cada 4 dias)")) emails.mutate();
                }}
                disabled={emails.isPending}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2 text-xs font-semibold disabled:opacity-60"
              >
                {emails.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Enviar e-mails agora
              </button>
            </div>
            {aviso && <p className="mt-3 text-sm font-semibold">{aviso}</p>}

            {lista.isPending ? (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {linhas.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cliente neste filtro.</p>}
                {linhas.map((l) => {
                  const numero = normalizarWhatsapp(l.whatsapp);
                  const chamado = mesmoMes(l.contatoEm);
                  return (
                    <div key={l.id} className="card-premium flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{l.nome || "Sem nome"}</p>
                        <p className="break-all text-xs text-muted-foreground">
                          {l.protocolo} · {l.numeroProcesso}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded-full bg-secondary px-2 py-0.5">{ROTULO[l.status] ?? l.status}</span>
                          {l.finalidade && (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5">
                              {FINALIDADES[l.finalidade as keyof typeof FINALIDADES] ?? l.finalidade}
                            </span>
                          )}
                          <span className="text-muted-foreground">Pedido em {dataBr(l.criadoEm)}</span>
                          <span className="text-muted-foreground">{formatarBRL(l.valorCentavos)}</span>
                          {l.emailEm && <span className="text-muted-foreground">E-mail: {dataBr(l.emailEm)}</span>}
                          {l.contatoEm && <span className="text-muted-foreground">WhatsApp: {dataBr(l.contatoEm)}</span>}
                        </div>
                      </div>
                      {numero ? (
                        <a
                          href={`https://wa.me/${numero}?text=${encodeURIComponent(mensagem(l))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => contato.mutate(l.id)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${chamado ? "border border-input bg-card" : "bg-primary text-primary-foreground"}`}
                        >
                          {chamado ? <CheckCircle2 className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                          {chamado ? "Chamar de novo" : "Chamar no WhatsApp"}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem WhatsApp válido</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
