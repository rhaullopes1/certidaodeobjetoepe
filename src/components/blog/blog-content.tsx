import { Link } from "@tanstack/react-router";
import type { Bloco } from "@/lib/blog";

export function BlogContent({ blocos }: { blocos: Bloco[] }) {
  return (
    <div className="mt-10 space-y-6">
      {blocos.map((b, i) => {
        switch (b.t) {
          case "h":
            return (
              <h2 key={i} className="pt-4 font-display text-2xl font-bold leading-snug">
                {b.x}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="text-base leading-relaxed text-muted-foreground">
                {b.x}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
                {b.items.map((it, j) => (
                  <li key={j} className="list-disc">{it}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
                {b.items.map((it, j) => (
                  <li key={j} className="list-decimal">{it}</li>
                ))}
              </ol>
            );
          case "tabela":
            return (
              <div key={i} className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} className="px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j} className="border-t border-border">
                        {row.map((cell, k) => (
                          <td key={k} className="px-4 py-3 text-muted-foreground">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "nota":
            return (
              <aside key={i} className="rounded-2xl border border-gold/40 bg-secondary/60 p-5 text-sm leading-relaxed">
                {b.x}
              </aside>
            );
          case "cta":
            return (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-base leading-relaxed">{b.x}</p>
                <Link
                  to="/solicitar"
                  className="mt-4 inline-flex items-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-accent-foreground"
                >
                  Solicitar certidão
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
