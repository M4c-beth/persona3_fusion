import { bestOptions } from "@/lib/game/companions";
import { cn } from "@/lib/utils";
import type { SocialLinkRank } from "@/types/game";

const tone = (value: string) =>
  /^\+[1-9]/.test(value) ? "text-p3r-cyan font-semibold" : /^[+-]?0$/.test(value) ? "text-muted-foreground" : "text-p3r-sky";

/** One collapsible rank: each prompt, then the answers with points with / without a matching Persona. */
export function RankAnswers({ rank, open }: { rank: SocialLinkRank; open?: boolean }) {
  return (
    <details open={open} className="group border bg-card [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 hover:bg-accent/40">
        <span className="font-heading text-sm font-bold uppercase tracking-wider text-p3r-white">{rank.label}</span>
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          {rank.prompts.length ? `${rank.prompts.length} ${rank.prompts.length === 1 ? "choice" : "choices"}` : "No choices"}
          <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
        </span>
      </summary>
      <div className="space-y-4 border-t px-4 py-4">
        {rank.prompts.map((prompt, i) => {
          const best = bestOptions(prompt);
          return (
            <table key={i} className="w-full text-sm">
              <caption className="bg-p3r-navy/80 px-3 py-2 text-left text-p3r-white">{prompt.line}</caption>
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-1.5 text-left font-semibold">Answer</th>
                  <th className="px-2 py-1.5 font-semibold" title="With a matching Persona">With</th>
                  <th className="px-2 py-1.5 font-semibold" title="Without a matching Persona">Without</th>
                </tr>
              </thead>
              <tbody>
                {prompt.options.map((o) => {
                  const isBest = best.includes(o);
                  return (
                    <tr key={o.text} className={cn("border-b border-border/50 last:border-0", isBest && "bg-p3r-cyan/10")}>
                      <td className="px-3 py-2">
                        {isBest ? <span className="mr-2 text-p3r-cyan" aria-label="Best answer">★</span> : null}
                        {o.text}
                      </td>
                      <td className={cn("w-16 px-2 py-2 text-center font-mono tabular-nums sm:w-24", tone(o.with))}>{o.with}</td>
                      <td className={cn("w-16 px-2 py-2 text-center font-mono tabular-nums sm:w-24", tone(o.without))}>{o.without}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        })}
        {rank.bonus ? (
          <p className="text-sm text-p3r-sky">
            Bonus item: <span className="text-p3r-white">{rank.bonus}</span>
          </p>
        ) : null}
      </div>
    </details>
  );
}
