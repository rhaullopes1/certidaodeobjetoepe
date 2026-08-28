import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

export const Route = createFileRoute("/certidao-objeto-e-pe-trf6")({
  head: () => trfHead(trfPorSigla("TRF6")!),
  component: Trf6Page,
});

function Trf6Page() {
  return <TrfLanding trf={trfPorSigla("TRF6")!} />;
}
