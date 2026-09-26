import { createFileRoute, redirect } from "@tanstack/react-router";

// Página consolidada em /certidao-de-objeto-e-pe/sp (evita canibalização no Google).
export const Route = createFileRoute("/certidao-objeto-e-pe-tjsp")({
  beforeLoad: () => {
    throw redirect({ to: "/certidao-de-objeto-e-pe/$uf", params: { uf: "sp" }, statusCode: 301 });
  },
});
