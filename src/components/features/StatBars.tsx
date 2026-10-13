import { STAT_LABEL } from "@/lib/game/labels";
import { STAT_KEYS, type Persona } from "@/types/game";

export function StatBars({ stats }: { stats: Persona["stats"] }) {
  return (
    <dl className="space-y-2">
      {STAT_KEYS.map((key) => (
        <div key={key} className="grid grid-cols-[2rem_2rem_1fr] items-center gap-2 text-sm">
          <dt className="font-heading font-bold uppercase tracking-wider text-muted-foreground">{STAT_LABEL[key]}</dt>
          <dd className="text-right font-mono tabular-nums">{stats[key]}</dd>
          <dd className="h-1.5 overflow-hidden bg-secondary" aria-hidden>
            <div className="h-full bg-p3r-yellow" style={{ width: `${(stats[key] / 99) * 100}%` }} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
