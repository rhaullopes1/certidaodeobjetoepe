import { createFileRoute } from "@tanstack/react-router";
import { TrfLanding, trfHead } from "@/components/site/trf-landing";
import { trfPorSigla } from "@/lib/trf-seo";

const TRF = trfPorSigla("TRF4")!;

export const Route = createFileRoute("/certidao-objeto-e-pe-trf4")({
  head: () => trfHead(TRF),
  component: () => <TrfLanding trf={TRF} />,
});
