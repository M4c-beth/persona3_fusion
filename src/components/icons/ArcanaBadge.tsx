import type { Arcana } from "@/types/game";
import { ARCANA_NUMERAL } from "@/lib/game/labels";
import { cn } from "@/lib/utils";

/** Slanted tarot tag: numeral + arcana name. */
export function ArcanaBadge({ arcana, className }: { arcana: Arcana; className?: string }) {
  const numeral = ARCANA_NUMERAL[arcana];
  return (
    <span
      className={cn(
        "clip-slant inline-flex items-center gap-1.5 bg-p3r-blue/45 px-2.5 py-0.5 font-heading text-sm font-semibold uppercase tracking-wide text-p3r-cyan",
        className,
      )}
    >
      {numeral ? <span className="text-p3r-cyan/90">{numeral}</span> : null}
      <span className="text-foreground/90">{arcana}</span>
    </span>
  );
}
