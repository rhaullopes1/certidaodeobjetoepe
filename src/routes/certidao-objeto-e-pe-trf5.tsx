import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

export const Route = createFileRoute("/certidao-objeto-e-pe-trf5")({
  head: () => trfHead(trfPorSigla("TRF5")!),
  component: Trf5Page,
});

function Trf5Page() {
  return <TrfLanding trf={trfPorSigla("TRF5")!} />;
}
