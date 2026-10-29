import { Link } from "@tanstack/react-router";

/**
 * Bloco reutilizável de links internos para os hubs do site.
 * Distribui autoridade para estados, TRFs e públicos de maior demanda,
 * para que essas páginas não fiquem alcançáveis apenas pelo sitemap.
 */
const HUBS = [
  { to: "/solicitar", label: "Solicitar certidão online" },
  { to: "/certidao-de-objeto-e-pe", label: "Certidão por estado" },
  { to: "/certidao-de-objeto-e-pe/para", label: "Para o seu caso" },
  { to: "/tribunais", label: "Tribunais atendidos" },
  { to: "/guias", label: "Guias práticos" },
  { to: "/blog", label: "Blog" },
] as const;

const ESTADOS = [
  { uf: "sp", label: "São Paulo (TJSP)" },
  { uf: "mg", label: "Minas Gerais (TJMG)" },
  { uf: "rj", label: "Rio de Janeiro (TJRJ)" },
  { uf: "pr", label: "Paraná (TJPR)" },
  { uf: "rs", label: "Rio Grande do Sul (TJRS)" },
  { uf: "ba", label: "Bahia (TJBA)" },
  { uf: "go", label: "Goiás (TJGO)" },
  { uf: "df", label: "Distrito Federal (TJDFT)" },
] as const;

const TRFS = [
  { to: "/certidao-objeto-e-pe-trf1", label: "TRF1" },
  { to: "/certidao-objeto-e-pe-trf2", label: "TRF2" },
  { to: "/certidao-objeto-e-pe-trf3", label: "TRF3" },
  { to: "/certidao-objeto-e-pe-trf4", label: "TRF4" },
  { to: "/certidao-objeto-e-pe-trf5", label: "TRF5" },
  { to: "/certidao-objeto-e-pe-trf6", label: "TRF6" },
] as const;

const PUBLICOS = [
  { slug: "concurso-publico", label: "Concurso público" },
  { slug: "motorista-de-aplicativo", label: "Motorista de aplicativo" },
  { slug: "caminhoneiro", label: "Caminhoneiro" },
  { slug: "financiamento", label: "Financiamento" },
  { slug: "compra-e-venda-de-imovel", label: "Compra e venda de imóvel" },
] as const;

const pill =
  "inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary";

export function LinksRelacionados({
  titulo = "Explore também",
  className = "",
}: {
  titulo?: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="text-xl font-bold">{titulo}</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {HUBS.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className={pill}>{item.label}</Link>
          </li>
        ))}
      </ul>

      <nav aria-label="Certidão de objeto e pé por estado" className="mt-8">
        <h3 className="text-base font-semibold">Certidão de objeto e pé por estado</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <li key={e.uf}>
              <Link to="/certidao-de-objeto-e-pe/$uf" params={{ uf: e.uf }} className={pill}>
                {e.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Justiça Federal" className="mt-6">
        <h3 className="text-base font-semibold">Justiça Federal</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {TRFS.map((t) => (
            <li key={t.to}>
              <Link to={t.to} className={pill}>Certidão de objeto e pé {t.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Para o seu caso" className="mt-6">
        <h3 className="text-base font-semibold">Para o seu caso</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {PUBLICOS.map((p) => (
            <li key={p.slug}>
              <Link to="/certidao-de-objeto-e-pe/para/$slug" params={{ slug: p.slug }} className={pill}>
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
