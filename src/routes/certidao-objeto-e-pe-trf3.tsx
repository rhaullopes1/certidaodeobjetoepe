import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

const TRF = trfPorSigla("TRF3")!;

export const Route = createFileRoute("/certidao-objeto-e-pe-trf3")({
  head: () => trfHead(TRF),
  component: () => <TrfLanding trf={TRF} />,
});
