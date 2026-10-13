import Link from "next/link";
import { ElementIcon } from "@/components/icons/ElementIcon";
import { getSkill } from "@/lib/game/data";
import type { PersonaSkill } from "@/types/game";

export function SkillList({ skills }: { skills: PersonaSkill[] }) {
  return (
    <ul className="divide-y divide-border/50 rounded-md border bg-card/60">
      {skills.map((entry) => {
        const skill = getSkill(entry.name);
        if (!skill) return null;
        return (
          <li key={entry.name} className="flex items-start gap-3 px-3 py-2.5">
            <ElementIcon type={skill.type} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <Link href={`/skills/?q=${encodeURIComponent(skill.name)}`} className="font-medium hover:text-p3r-cyan">
                  {skill.name}
                </Link>
                <span className="shrink-0 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {entry.fusionSpell ? "Fusion spell" : entry.level === 0 ? "Innate" : `Lv ${entry.level}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {[skill.cost, skill.power ? `${skill.power} power` : "", skill.effect].filter(Boolean).join(" · ") ||
                  skill.target}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
