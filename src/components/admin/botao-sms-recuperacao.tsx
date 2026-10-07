/**
 * Botão de SMS de recuperação: escolhe a etapa, mostra o texto e envia pelo servidor.
 */
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Smartphone, Loader2 } from "lucide-react";
import { enviarSmsRecuperacao } from "@/lib/recuperacao.functions";
import { MODELOS_SMS, montarSms, telefoneE164, etapaSmsSugerida, type EtapaSms } from "@/lib/sms";

export function BotaoSmsRecuperacao({
  linha,
}: {
  linha: { id: string; clienteNome: string | null; protocolo: string; whatsapp: string | null; etapa: number };
}) {
  const enviar = useServerFn(enviarSmsRecuperacao);
  const [aberto, setAberto] = useState(false);
  const [etapa, setEtapa] = useState<EtapaSms>(etapaSmsSugerida(linha.etapa));
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok" | "erro">("livre");
  const [msg, setMsg] = useState("");
  const base = "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors";

  if (!telefoneE164(linha.whatsapp)) {
    return (
      <span className={`${base} cursor-not-allowed border-white/10 text-white/30`} title="Sem celular válido">
        <Smartphone className="h-3.5 w-3.5" /> SMS
      </span>
    );
  }

  const texto = montarSms(etapa, { nome: linha.clienteNome, protocolo: linha.protocolo });

  async function disparar() {
    setEstado("enviando");
    try {
      await enviar({ data: { id: linha.id, etapa } });
      setEstado("ok");
      setMsg("SMS enviado.");
    } catch (e) {
      setEstado("erro");
      setMsg(e instanceof Error ? e.message : "Falha no envio.");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className={`${base} ${estado === "ok" ? "border-emerald-400/40 text-emerald-300" : "border-sky-400/30 text-sky-300 hover:bg-sky-400/10"}`}
      >
        <Smartphone className="h-3.5 w-3.5" /> {estado === "ok" ? "SMS enviado" : "SMS"}
      </button>
      {aberto && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-white/15 bg-zinc-900 p-3 text-xs shadow-xl">
          <div className="flex gap-1">
            {([1, 2, 3] as EtapaSms[]).map((n) => (
              <button
                key={n}
                onClick={() => setEtapa(n)}
                className={`flex-1 rounded-md px-2 py-1 ${etapa === n ? "bg-white/20 text-white" : "bg-white/5 text-white/60"}`}
              >
                Etapa {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-white/50">{MODELOS_SMS[etapa].titulo}</p>
          <p className="mt-2 rounded-md bg-white/5 p-2 leading-relaxed text-white/90">{texto}</p>
          <p className={`mt-1 text-right ${texto.length > 160 ? "text-red-400" : "text-white/40"}`}>
            {texto.length}/160
          </p>
          <button
            disabled={estado === "enviando"}
            onClick={disparar}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500/80 px-3 py-2 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {estado === "enviando" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Smartphone className="h-3.5 w-3.5" />}
            Enviar SMS para {linha.whatsapp}
          </button>
          {msg && <p className={`mt-2 ${estado === "erro" ? "text-red-400" : "text-emerald-300"}`}>{msg}</p>}
        </div>
      )}
    </div>
  );
}
