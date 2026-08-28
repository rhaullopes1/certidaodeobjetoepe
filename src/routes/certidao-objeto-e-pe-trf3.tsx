import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

export const Route = createFileRoute("/certidao-objeto-e-pe-trf3")({
  head: () => trfHead(trfPorSigla("TRF3")!),
  component: Trf3Page,
});

function Trf3Page() {
  return <TrfLanding trf={trfPorSigla("TRF3")!} />;
}
