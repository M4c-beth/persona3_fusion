import type { Weekday } from "@/types/game";
import { cn } from "@/lib/utils";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** M T W T F S S, with the days someone is available lit up. */
export function WeekStrip({ days, night }: { days: Weekday[]; night?: boolean }) {
  const every = days.includes("Every day");
  const label = every ? "Every day" : days.join(", ");
  return (
    <div className="flex items-center gap-1" aria-label={`Available: ${label}${night ? " (night)" : ""}`}>
      {WEEK.map((d) => {
        const on = every || days.includes(d);
        return (
          <span
            key={d}
            aria-hidden
            className={cn(
              "grid h-6 w-7 place-items-center text-[11px] font-bold",
              on ? "bg-p3r-white text-p3r-navy" : "bg-secondary text-muted-foreground/50",
            )}
          >
            {d.slice(0, 2)}
          </span>
        );
      })}
      {days.includes("Holidays") ? <span className="ml-1 text-xs text-p3r-sky">+ holidays</span> : null}
      {night ? <span className="ml-1 text-xs text-p3r-sky">night</span> : null}
    </div>
  );
}
