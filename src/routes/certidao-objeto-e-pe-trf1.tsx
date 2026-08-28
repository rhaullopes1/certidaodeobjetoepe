import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

const TRF = trfPorSigla("TRF1")!;

export const Route = createFileRoute("/certidao-objeto-e-pe-trf1")({
  head: () => trfHead(TRF),
  component: () => <TrfLanding trf={TRF} />,
});
