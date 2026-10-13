import type { Affinity } from "@/types/game";
import { AFFINITY_LABEL, AFFINITY_SHORT } from "@/lib/game/labels";
import { cn } from "@/lib/utils";

const TONE: Record<Affinity, string> = {
  weak: "text-[var(--elem-fire)] font-semibold",
  normal: "text-muted-foreground/40",
  resist: "text-foreground/80",
  null: "text-p3r-blue-light font-semibold",
  repel: "text-p3r-yellow font-semibold",
  absorb: "text-[var(--elem-recovery)] font-semibold",
};

export function AffinityCell({ affinity, className }: { affinity: Affinity; className?: string }) {
  return (
    <span className={cn("font-heading text-sm uppercase tracking-wide", TONE[affinity], className)} title={AFFINITY_LABEL[affinity]}>
      {AFFINITY_SHORT[affinity]}
    </span>
  );
}
