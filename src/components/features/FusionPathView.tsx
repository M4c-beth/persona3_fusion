import { ElementIcon } from "@/components/icons/ElementIcon";
import { getSkill } from "@/lib/game/data";
import { flattenPath, type PlanStep, type SkillAssignment } from "@/lib/game/planner";
import { cn } from "@/lib/utils";
import { PersonaLink } from "./PersonaLink";

function SkillChip({ skill, note }: { skill: SkillAssignment; note?: string }) {
  const data = getSkill(skill.name);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2 py-0.5 text-xs">
      {data ? <ElementIcon type={data.type} title="" className="size-3.5" /> : null}
      {skill.name}
      {note ? <span className="text-muted-foreground">{note}</span> : null}
    </span>
  );
}

/** Native skills the persona only learns after its base level. */
function levelUps(step: PlanStep) {
  return step.skills.filter((s) => s.source === "native" && (s.level ?? 0) > step.persona.level);
}

export function FusionPathView({ path }: { path: PlanStep }) {
  const { obtain, fusions } = flattenPath(path);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Get these first <span className="opacity-60">{obtain.length}</span>
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {obtain.map((step, i) => (
            <li key={`${step.persona.name}-${i}`} className="space-y-1.5 rounded-md border bg-card/60 px-3 py-2.5">
              <PersonaLink persona={step.persona} className="text-sm" />
              {step.skills.length ? (
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {step.skills.map((s) => (
                    <SkillChip
                      key={s.name}
                      skill={s}
                      note={(s.level ?? 0) > step.persona.level ? `Lv ${s.level}` : undefined}
                    />
                  ))}
                </div>
              ) : null}
              {step.levelTo ? (
                <p className="pl-8 text-xs text-p3r-gold">
                  Level to {step.levelTo} before fusing
                  {step.skills.some((s) => s.level === step.levelTo) ? null : (
                    <span className="text-muted-foreground"> · knows enough skills to pass them on</span>
                  )}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Fusions <span className="opacity-60">{fusions.length}</span>
        </h3>
        <ol className="space-y-2">
          {fusions.map((step, i) => {
            const last = i === fusions.length - 1;
            const inherited = step.skills.filter((s) => s.source === "inherited");
            const later = levelUps(step);
            return (
              <li
                key={`${step.persona.name}-${i}`}
                className={cn(
                  "grid gap-3 rounded-md border bg-card/60 p-3 sm:grid-cols-[2.5rem_1fr]",
                  last && "border-p3r-yellow/50 bg-p3r-yellow/5",
                )}
              >
                <span
                  className={cn(
                    "clip-slant grid h-7 w-9 place-items-center font-heading text-sm font-extrabold",
                    last ? "bg-p3r-yellow text-p3r-black" : "bg-p3r-blue text-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 space-y-2">
                  {step.special ? (
                    <p className="font-heading text-xs font-bold uppercase tracking-wider text-p3r-gold">Special fusion</p>
                  ) : null}
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
                    {step.ingredients?.map((ing, j) => (
                      <span key={`${ing.persona.name}-${j}`} className="flex items-center gap-2">
                        {j > 0 ? <span className="font-heading font-bold text-p3r-yellow">+</span> : null}
                        <PersonaLink persona={ing.persona} />
                      </span>
                    ))}
                    <span className="flex items-center gap-2">
                      <span className="font-heading font-bold text-p3r-yellow">→</span>
                      <PersonaLink persona={step.persona} className={cn(last && "text-p3r-yellow")} />
                    </span>
                  </div>
                  {inherited.length ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Inherit</span>
                      {inherited.map((s) => (
                        <SkillChip key={s.name} skill={s} />
                      ))}
                    </div>
                  ) : null}
                  {later.length ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Then learns</span>
                      {later.map((s) => (
                        <SkillChip key={s.name} skill={s} note={`Lv ${s.level}`} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
