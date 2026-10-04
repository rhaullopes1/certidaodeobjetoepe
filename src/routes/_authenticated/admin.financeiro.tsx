import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { souEquipe } from "@/lib/admin";
import { AdminHeader, SemPermissao } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/financeiro")({
  component: Financeiro,
  head: () => ({
    meta: [
      { title: "Cockpit financeiro | Certidão Objeto e Pé" },
      { name: "description", content: "Faturamento diário e mensal comparado à meta." },
      { property: "og:title", content: "Cockpit financeiro | Certidão Objeto e Pé" },
      { property: "og:description", content: "Metas, faturamento e histórico mensal da operação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const META_DIA = 1000; // R$ por dia
const TZ = "America/Sao_Paulo";
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const diaSP = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

type Venda = { pago_em: string; valor_centavos: number; created_at: string };

async function carregar() {
  const pagos = await supabase
    .from("pedidos")
    .select("pago_em, valor_centavos, created_at")
    .not("pago_em", "is", null)
    .gt("valor_centavos", 0)
    .not("protocolo", "ilike", "TESTE%")
    .neq("status", "cancelado")
    .limit(10000);
  if (pagos.error) throw pagos.error;
  const criados = await supabase
    .from("pedidos")
    .select("created_at")
    .gt("valor_centavos", 0)
    .not("protocolo", "ilike", "TESTE%")
    .limit(20000);
  if (criados.error) throw criados.error;
  return { vendas: (pagos.data ?? []) as Venda[], criados: (criados.data ?? []).map((c) => c.created_at) };
}

function Financeiro() {
  const permissao = useQuery({ queryKey: ["equipe"], queryFn: souEquipe });
  const q = useQuery({ queryKey: ["admin-financeiro"], queryFn: carregar, enabled: permissao.data === true });
  const hojeStr = diaSP(new Date().toISOString());
  const [mes, setMes] = useState(hojeStr.slice(0, 7)); // YYYY-MM

  const dados = useMemo(() => {
    const porDia = new Map<string, { valor: number; qtd: number }>();
    for (const v of q.data?.vendas ?? []) {
      const d = diaSP(v.pago_em);
      const a = porDia.get(d) ?? { valor: 0, qtd: 0 };
      a.valor += v.valor_centavos / 100;
      a.qtd += 1;
      porDia.set(d, a);
    }
    const criadosMes = (q.data?.criados ?? []).filter((c) => diaSP(c).startsWith(mes)).length;
    const [ano, m] = mes.split("-").map(Number);
    const diasNoMes = new Date(ano, m, 0).getDate();
    const ehMesAtual = mes === hojeStr.slice(0, 7);
    const ehFuturo = mes > hojeStr.slice(0, 7);
    const diasCorridos = ehFuturo ? 0 : ehMesAtual ? Number(hojeStr.slice(8, 10)) : diasNoMes;

    let acum = 0;
    const dias = Array.from({ length: diasNoMes }, (_, i) => {
      const d = `${mes}-${String(i + 1).padStart(2, "0")}`;
      const r = porDia.get(d) ?? { valor: 0, qtd: 0 };
      const passou = i + 1 <= diasCorridos;
      acum += r.valor;
      return {
        dia: String(i + 1),
        data: d,
        valor: r.valor,
        qtd: r.qtd,
        acumulado: passou ? acum : null,
        metaAcum: (i + 1) * META_DIA,
        passou,
      };
    });
    const faturado = dias.reduce((s, d) => s + d.valor, 0);
    const pedidos = dias.reduce((s, d) => s + d.qtd, 0);
    const metaMes = diasNoMes * META_DIA;
    const metaAteHoje = diasCorridos * META_DIA;
    const diasBatidos = dias.filter((d) => d.passou && d.valor >= META_DIA).length;
    const restantes = diasNoMes - diasCorridos;
    const projecao = diasCorridos ? (faturado / diasCorridos) * diasNoMes : 0;
    const hoje = porDia.get(hojeStr) ?? { valor: 0, qtd: 0 };

    // histórico mensal
    const porMes = new Map<string, { valor: number; qtd: number }>();
    for (const [d, r] of porDia) {
      const k = d.slice(0, 7);
      const a = porMes.get(k) ?? { valor: 0, qtd: 0 };
      a.valor += r.valor;
      a.qtd += r.qtd;
      porMes.set(k, a);
    }
    const meses = [...porMes.keys()].sort().map((k) => {
      const [a, mm] = k.split("-").map(Number);
      const dn = new Date(a, mm, 0).getDate();
      const r = porMes.get(k)!;
      return { k, rotulo: `${MESES[mm - 1]}/${String(a).slice(2)}`, valor: r.valor, qtd: r.qtd, meta: dn * META_DIA, ticket: r.qtd ? r.valor / r.qtd : 0 };
    });

    return {
      dias, faturado, pedidos, metaMes, metaAteHoje, diasBatidos, diasCorridos, restantes, projecao, hoje, meses,
      ticket: pedidos ? faturado / pedidos : 0,
      conversao: criadosMes ? (pedidos / criadosMes) * 100 : null,
      criadosMes,
      faltaDia: restantes > 0 ? Math.max(0, metaMes - faturado) / restantes : 0,
      ehMesAtual,
    };
  }, [q.data, mes, hojeStr]);

  const mudarMes = (delta: number) => {
    const [a, m] = mes.split("-").map(Number);
    const d = new Date(a, m - 1 + delta, 1);
    setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const [a, m] = mes.split("-").map(Number);
  const pctMes = dados.metaMes ? Math.min(100, (dados.faturado / dados.metaMes) * 100) : 0;
  const saldo = dados.faturado - dados.metaAteHoje;

  const Card = ({ r, v, s, tom }: { r: string; v: string; s?: string; tom?: "ok" | "mal" }) => (
    <div className="card-premium min-w-0 p-4">
      <p className="truncate text-[11px] font-semibold uppercase text-muted-foreground">{r}</p>
      <p className={`mt-1 truncate text-xl font-bold sm:text-2xl ${tom === "ok" ? "text-live" : tom === "mal" ? "text-destructive" : ""}`}>{v}</p>
      {s && <p className="mt-0.5 truncate text-xs text-muted-foreground">{s}</p>}
    </div>
  );

  return (
    <div className="min-h-dvh bg-secondary/40">
      <AdminHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Cockpit financeiro</h1>
            <p className="text-sm text-muted-foreground">Meta de {brl(META_DIA)} por dia · valores pelos pagamentos confirmados (horário de Brasília).</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => mudarMes(-1)} className="rounded-lg border border-border bg-card p-2" aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></button>
            <span className="min-w-32 text-center font-semibold capitalize">{new Date(a, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
            <button onClick={() => mudarMes(1)} className="rounded-lg border border-border bg-card p-2" aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>

        {permissao.data === false && <SemPermissao />}
        {(permissao.isPending || q.isPending) && permissao.data !== false && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</p>
        )}
        {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}

        {q.data && (
          <>
            <div className="card-premium p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Abertura 01/{String(m).padStart(2, "0")} · Fechamento {dados.dias.length}/{String(m).padStart(2, "0")}
                </p>
                <p className="text-sm font-semibold">{brl(dados.faturado)} de {brl(dados.metaMes)} ({pctMes.toFixed(0)}%)</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div className={`h-full ${pctMes >= 100 ? "bg-live" : "bg-gold"}`} style={{ width: `${pctMes}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {dados.ehMesAtual && <Card r="Hoje" v={brl(dados.hoje.valor)} s={`${dados.hoje.qtd} pedido(s) · meta ${brl(META_DIA)}`} tom={dados.hoje.valor >= META_DIA ? "ok" : undefined} />}
              <Card r="Faturado no mês" v={brl(dados.faturado)} s={`${dados.pedidos} pedidos pagos`} />
              <Card r={dados.ehMesAtual ? "Saldo vs meta até hoje" : "Saldo vs meta"} v={`${saldo >= 0 ? "+" : ""}${brl(saldo)}`} s={`meta até aqui ${brl(dados.metaAteHoje)}`} tom={saldo >= 0 ? "ok" : "mal"} />
              <Card r="Dias com meta batida" v={`${dados.diasBatidos}/${dados.diasCorridos}`} s="dias ≥ R$ 1.000" />
              <Card r="Ticket médio" v={brl(dados.ticket)} />
              <Card r="Conversão" v={dados.conversao === null ? "—" : `${dados.conversao.toFixed(0)}%`} s={`${dados.pedidos} pagos de ${dados.criadosMes} criados`} />
              {dados.ehMesAtual && <Card r="Projeção de fechamento" v={brl(dados.projecao)} s="no ritmo atual" tom={dados.projecao >= dados.metaMes ? "ok" : "mal"} />}
              {dados.ehMesAtual && dados.restantes > 0 && <Card r="Necessário por dia" v={brl(dados.faltaDia)} s={`nos ${dados.restantes} dias restantes`} />}
            </div>

            <div className="card-premium p-4 sm:p-5">
              <h2 className="font-semibold">Faturamento por dia</h2>
              <p className="text-xs text-muted-foreground">Verde = meta batida · linha = meta diária</p>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.dias} margin={{ left: -10, right: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => brl(v)} labelFormatter={(l) => `Dia ${l}`} />
                    <ReferenceLine y={META_DIA} stroke="var(--destructive)" strokeDasharray="4 4" />
                    <Bar dataKey="valor" name="Faturado" radius={[3, 3, 0, 0]}>
                      {dados.dias.map((d) => (
                        <Cell key={d.dia} fill={d.valor >= META_DIA ? "var(--live)" : "var(--gold)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-premium p-4 sm:p-5">
              <h2 className="font-semibold">Acumulado do mês vs meta</h2>
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dados.dias} margin={{ left: -10, right: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => brl(v)} labelFormatter={(l) => `Dia ${l}`} />
                    <Line dataKey="metaAcum" name="Meta" stroke="var(--muted-foreground)" strokeDasharray="4 4" dot={false} />
                    <Line dataKey="acumulado" name="Realizado" stroke="var(--primary)" strokeWidth={2.5} dot={false} connectNulls={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-premium p-4 sm:p-5">
              <h2 className="font-semibold">Histórico mensal da operação</h2>
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dados.meses} margin={{ left: -10, right: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="rotulo" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Bar dataKey="valor" name="Faturado" fill="var(--gold)" radius={[3, 3, 0, 0]} />
                    <Line dataKey="meta" name="Meta do mês" stroke="var(--destructive)" strokeDasharray="4 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="py-2">Mês</th><th>Faturado</th><th>Meta</th><th>% meta</th><th>Pedidos</th><th>Ticket</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[...dados.meses].reverse().map((r) => (
                      <tr key={r.k} className="cursor-pointer hover:bg-secondary/50" onClick={() => setMes(r.k)}>
                        <td className="py-2 font-semibold">{r.rotulo}</td>
                        <td>{brl(r.valor)}</td>
                        <td className="text-muted-foreground">{brl(r.meta)}</td>
                        <td className={r.valor >= r.meta ? "text-live" : ""}>{((r.valor / r.meta) * 100).toFixed(0)}%</td>
                        <td>{r.qtd}</td>
                        <td>{brl(r.ticket)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-premium overflow-x-auto p-4 sm:p-5">
              <h2 className="font-semibold">Detalhe diário</h2>
              <table className="mt-3 w-full min-w-[420px] text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2">Dia</th><th>Pedidos</th><th>Faturado</th><th>vs meta</th><th>Acumulado</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {dados.dias.filter((d) => d.passou).map((d) => (
                    <tr key={d.data}>
                      <td className="py-1.5">{d.data.slice(8)}/{d.data.slice(5, 7)}</td>
                      <td>{d.qtd}</td>
                      <td>{brl(d.valor)}</td>
                      <td className={d.valor >= META_DIA ? "text-live" : "text-destructive"}>{d.valor - META_DIA >= 0 ? "+" : ""}{brl(d.valor - META_DIA)}</td>
                      <td>{d.acumulado !== null ? brl(d.acumulado) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
