import type { Arcana } from "@/types/game";
import { ARCANA_NUMERAL } from "@/lib/game/labels";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const words = name.replace(/[^A-Za-z& ]/g, " ").split(/[\s&]+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.replace(/[^A-Za-z]/g, "").slice(0, 2)).toUpperCase();
}

/** Original tarot-card badge: arcana numeral over the character's initials. */
export function CharacterIcon({ name, arcana, className }: { name: string; arcana: Arcana; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid aspect-[3/4] w-14 shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-p3r-blue via-p3r-navy to-p3r-deep ring-1 ring-p3r-cyan/40 [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]",
        className,
      )}
    >
      <span className="absolute left-[18%] top-1 text-[10px] font-bold text-p3r-sky">{ARCANA_NUMERAL[arcana] || "Æ"}</span>
      <span className="display text-2xl text-p3r-white">{initials(name)}</span>
      <span className="absolute inset-x-0 bottom-0 h-1 bg-p3r-cyan" />
    </span>
  );
}
