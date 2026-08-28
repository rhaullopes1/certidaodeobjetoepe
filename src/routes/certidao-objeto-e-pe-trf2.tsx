import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

export const Route = createFileRoute("/certidao-objeto-e-pe-trf2")({
  head: () => trfHead(trfPorSigla("TRF2")!),
  component: Trf2Page,
});

function Trf2Page() {
  return <TrfLanding trf={trfPorSigla("TRF2")!} />;
}
