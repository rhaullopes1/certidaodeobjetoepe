import { Link } from "@tanstack/react-router";

/**
 * Bloco reutilizável de links internos para os hubs do site.
 * Serve para que páginas de conteúdo não fiquem alcançáveis apenas pelo sitemap.
 */
export function LinksRelacionados({
  titulo = "Explore também",
  className = "",
}: {
  titulo?: string;
  className?: string;
}) {
  const itens = [
    { to: "/solicitar", label: "Solicitar certidão online" },
    { to: "/certidao-de-objeto-e-pe", label: "Certidão por estado" },
    { to: "/certidao-de-objeto-e-pe/para", label: "Para o seu caso" },
    { to: "/tribunais", label: "Tribunais atendidos" },
    { to: "/guias", label: "Guias práticos" },
    { to: "/blog", label: "Blog" },
  ] as const;

  return (
    <section className={className}>
      <h2 className="text-xl font-bold">{titulo}</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {itens.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
