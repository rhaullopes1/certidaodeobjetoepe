import { ExternalLink, Mail, Phone, Send } from "lucide-react";
import {
  ROTULO_STATUS,
  ROTULO_TIPO,
  type CanalSolicitacao,
  type StatusCanal,
} from "@/lib/canal-solicitacao";

export const CLASSE_STATUS: Record<StatusCanal, string> = {
  confirmado: "bg-accent/15 text-accent",
  canal_tribunal: "bg-primary/10 text-primary",
  nao_cadastrado: "bg-destructive/10 text-destructive",
};

export function fmtDataCanal(v: string | null | undefined) {
  if (!v) return null;
  const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR");
}

const btn =
  "inline-flex items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary";

export function SeloCanal({ status }: { status: StatusCanal }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${CLASSE_STATUS[status]}`}>
      {ROTULO_STATUS[status]}
    </span>
  );
}

export function AcoesCanal({ c }: { c: CanalSolicitacao }) {
  const tel = c.telefone?.split("/")[0].replace(/\D/g, "");
  return (
    <div className="flex flex-wrap gap-2">
      {c.url && (
        <a href={c.url} target="_blank" rel="noopener noreferrer" className={btn}>
          <Send className="h-3.5 w-3.5" /> {c.fallback ? "Abrir canal do tribunal" : "Abrir canal oficial"}
        </a>
      )}
      {c.balcaoVirtualUrl && (
        <a href={c.balcaoVirtualUrl} target="_blank" rel="noopener noreferrer" className={btn}>
          <ExternalLink className="h-3.5 w-3.5" /> Balcão Virtual
        </a>
      )}
      {c.email && (
        <a href={`mailto:${c.email}`} className={btn}>
          <Mail className="h-3.5 w-3.5" /> E-mail
        </a>
      )}
      {tel && tel.length >= 8 && (
        <a href={`tel:${tel}`} className={btn}>
          <Phone className="h-3.5 w-3.5" /> Ligar
        </a>
      )}
    </div>
  );
}

/** Bloco compacto "Onde solicitar" para a fila de entregas. */
export function OndeSolicitarResumo({ c }: { c: CanalSolicitacao }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Onde solicitar</span>
        <SeloCanal status={c.status} />
        {c.tipos.length > 0 && (
          <span className="text-xs text-muted-foreground">{c.tipos.map((t) => ROTULO_TIPO[t]).join(" · ")}</span>
        )}
      </div>
      {c.status === "nao_cadastrado" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhum canal oficial cadastrado para esta unidade nem para o tribunal.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm font-medium">{c.unidadeResponsavel}</p>
          {c.fallback && (
            <p className="text-xs text-muted-foreground">
              Canal específico não cadastrado — fallback: {c.rotuloCanalTribunal}
            </p>
          )}
          {(c.email || c.telefone) && (
            <p className="text-xs">{[c.email, c.telefone].filter(Boolean).join(" · ")}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Fonte: {[c.fonte, fmtDataCanal(c.fonteData)].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-2">
            <AcoesCanal c={c} />
          </div>
        </>
      )}
    </div>
  );
}
