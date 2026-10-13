import Link from "next/link";
import type { Persona } from "@/types/game";
import { cn } from "@/lib/utils";

/** Compact "Lv  Name  Arcana" reference used in recipe lists. */
export function PersonaLink({ persona, className }: { persona: Persona; className?: string }) {
  return (
    <Link
      href={`/persona/${persona.slug}/`}
      className={cn("group inline-flex min-w-0 items-baseline gap-2 hover:text-p3r-yellow", className)}
    >
      <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{persona.level}</span>
      <span className="truncate font-medium">{persona.name}</span>
      <span className="hidden shrink-0 text-xs text-muted-foreground group-hover:text-p3r-yellow/70 sm:inline">
        {persona.arcana}
      </span>
    </Link>
  );
}
