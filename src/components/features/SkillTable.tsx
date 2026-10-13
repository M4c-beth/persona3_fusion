"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ElementIcon } from "@/components/icons/ElementIcon";
import { Input } from "@/components/ui/input";
import { SKILLS, learnedBy } from "@/lib/game/data";
import { isAvailable } from "@/lib/game/fusion";
import { SKILL_TYPE_LABEL } from "@/lib/game/labels";
import { cn } from "@/lib/utils";
import { SKILL_TYPES, type SkillType } from "@/types/game";
import { useDlc } from "./DlcProvider";

const LEARNERS_SHOWN = 3;

export function SkillTable() {
  const { enabled } = useDlc();
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q")?.slice(0, 40) ?? "");
  const [type, setType] = useState<SkillType | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SKILLS.filter(
      (s) =>
        (!type || s.type === type) &&
        (!q || s.name.toLowerCase().includes(q) || s.effect.toLowerCase().includes(q)),
    )
      .map((skill) => ({ skill, learners: learnedBy(skill.name).filter((l) => isAvailable(l.persona, enabled)) }))
      .filter((r) => r.learners.length > 0)
      .sort(
        (a, b) =>
          SKILL_TYPES.indexOf(a.skill.type) - SKILL_TYPES.indexOf(b.skill.type) ||
          Number(a.skill.cost === "Theurgy") - Number(b.skill.cost === "Theurgy") ||
          a.skill.power - b.skill.power ||
          a.skill.name.localeCompare(b.skill.name),
      );
  }, [query, type, enabled]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          type="search"
          value={query}
          maxLength={40}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills or effects…"
          aria-label="Search skills or effects"
          className="h-10 lg:max-w-xs"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by type">
          {SKILL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(type === t ? null : t)}
              aria-pressed={type === t}
              title={SKILL_TYPE_LABEL[t]}
              className={cn(
                "grid size-9 place-items-center rounded-md border transition-colors",
                type === t ? "border-p3r-yellow bg-accent" : "border-transparent hover:bg-accent/50",
                type && type !== t && "opacity-40",
              )}
            >
              <ElementIcon type={t} />
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {rows.length} {rows.length === 1 ? "skill" : "skills"}{type ? ` · ${SKILL_TYPE_LABEL[type]}` : ""}
      </p>

      <ul className="divide-y divide-border/50 rounded-md border bg-card/60">
        {rows.map(({ skill, learners }) => (
          <li key={skill.name} className="grid gap-x-6 gap-y-1 px-3 py-2.5 text-sm md:grid-cols-[14rem_6rem_1fr_14rem]">
            <span className="flex items-center gap-2.5 font-medium">
              <ElementIcon type={skill.type} />
              {skill.name}
            </span>
            <span className="text-muted-foreground md:text-right md:font-mono md:tabular-nums">{skill.cost || "Passive"}</span>
            <span className="text-muted-foreground">
              {[skill.power ? `${skill.power} power` : "", skill.effect, skill.target].filter(Boolean).join(" · ")}
            </span>
            <span className="truncate text-xs text-muted-foreground md:text-sm">
              {learners.slice(0, LEARNERS_SHOWN).map(({ persona }, i) => (
                <span key={persona.name}>
                  {i > 0 ? ", " : ""}
                  <Link href={`/persona/${persona.slug}/`} className="text-foreground/80 hover:text-p3r-yellow">
                    {persona.name}
                  </Link>
                </span>
              ))}
              {learners.length > LEARNERS_SHOWN ? ` +${learners.length - LEARNERS_SHOWN}` : ""}
            </span>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="p-8 text-center text-muted-foreground">No skills match.</p> : null}
    </div>
  );
}
