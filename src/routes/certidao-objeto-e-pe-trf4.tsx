import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

export const Route = createFileRoute("/certidao-objeto-e-pe-trf4")({
  head: () => trfHead(trfPorSigla("TRF4")!),
  component: Trf4Page,
});

function Trf4Page() {
  return <TrfLanding trf={trfPorSigla("TRF4")!} />;
}
