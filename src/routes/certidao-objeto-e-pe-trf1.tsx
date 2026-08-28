import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

export const Route = createFileRoute("/certidao-objeto-e-pe-trf1")({
  head: () => trfHead(trfPorSigla("TRF1")!),
  component: Trf1Page,
});

function Trf1Page() {
  return <TrfLanding trf={trfPorSigla("TRF1")!} />;
}
