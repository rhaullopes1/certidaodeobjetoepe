import { createFileRoute, redirect } from "@tanstack/react-router";

// Página consolidada em /certidao-de-objeto-e-pe/pe (evita canibalização no Google).
export const Route = createFileRoute("/certidao-objeto-e-pe-tjpe")({
  beforeLoad: () => {
    throw redirect({ to: "/certidao-de-objeto-e-pe/$uf", params: { uf: "pe" }, statusCode: 301 });
  },
});
