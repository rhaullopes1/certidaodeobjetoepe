import efficiencyLogo from "@/assets/efficiency/logo.webp.asset.json";

export function EfficiencyBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={efficiencyLogo.url}
        alt="Efficiency Correspondentes Jurídicos"
        className={compact ? "h-8 w-auto max-w-36 object-contain" : "h-12 w-auto max-w-56 object-contain sm:h-14"}
      />
      {compact && <span className="hidden h-7 w-px bg-border sm:block" aria-hidden="true" />}
      {compact && (
        <span className="hidden text-[10px] font-semibold uppercase text-muted-foreground sm:block">
          Portal operacional
        </span>
      )}
    </div>
  );
}

export function FlyDoxCredit() {
  return (
    <p className="text-center text-[10px] uppercase text-muted-foreground">
      Powered by <span className="font-semibold text-foreground/70">FlyDox</span>
    </p>
  );
}