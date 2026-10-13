"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { ArcanaBadge } from "@/components/icons/ArcanaBadge";
import { getPersonaBySlug, getSkill, getSkillBySlug } from "@/lib/game/data";
import { SKILL_TYPE_LABEL } from "@/lib/game/labels";
import { findFusionPaths, type PlanFailure } from "@/lib/game/planner";
import { cn } from "@/lib/utils";
import type { Persona } from "@/types/game";
import { useDlc } from "./DlcProvider";
import { FusionPathView } from "./FusionPathView";
import { PersonaPicker } from "./PersonaPicker";
import { SkillPicker } from "./SkillPicker";

function describeFailure(failure: PlanFailure, target: Persona): string {
  switch (failure.kind) {
    case "blocked": {
      const type = getSkill(failure.skill)?.type;
      return failure.reason === "exclusive"
        ? `${failure.skill} is exclusive to its persona and can't be inherited.`
        : `${target.name} can't inherit ${type ? SKILL_TYPE_LABEL[type] : ""} skills like ${failure.skill}.`;
    }
    case "too-many-inherited":
      return `A fusion passes on at most ${failure.max} skills — ${failure.count} of these would need inheriting.`;
    case "too-many-skills":
      return "A persona can hold at most 8 skills.";
    case "no-recipe":
      return `${target.name} can't be fused with the personas currently available. Check the DLC menu.`;
    case "not-found":
      return "No fusion path found for this skill set within 3 fusions. Try fewer skills, or use skill cards for the rest.";
  }
}

export function FusionPlanner() {
  const { pool } = useDlc();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [choice, setChoice] = useState(0);

  const target = useMemo(() => {
    const persona = getPersonaBySlug(params.get("t") ?? "");
    return persona && pool.byName.has(persona.name) ? persona : null;
  }, [params, pool]);

  const skills = useMemo(
    () =>
      (params.get("s") ?? "")
        .split(",")
        .map((slug) => getSkillBySlug(slug)?.name)
        .filter((name): name is string => !!name),
    [params],
  );

  const available = useMemo(
    () => new Set(pool.personas.flatMap((p) => p.skills.map((s) => s.name))),
    [pool],
  );

  const update = useCallback(
    (next: { target?: Persona | null; skills?: string[] }) => {
      const qs = new URLSearchParams(params);
      if (next.target !== undefined) {
        if (next.target) qs.set("t", next.target.slug);
        else qs.delete("t");
        qs.delete("s");
      }
      if (next.skills !== undefined) {
        const slugs = next.skills.map((n) => getSkill(n)?.slug).filter(Boolean);
        if (slugs.length) qs.set("s", slugs.join(","));
        else qs.delete("s");
      }
      setChoice(0);
      const query = qs.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const request = useDeferredValue(useMemo(() => ({ target, skills, pool }), [target, skills, pool]));
  const result = useMemo(
    () => (request.target ? findFusionPaths(request.pool, request.target, request.skills) : null),
    [request],
  );
  const pending = request.target !== target || request.skills !== skills;
  const path = result?.paths[Math.min(choice, result.paths.length - 1)];

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <Field label="Persona to make">
          <PersonaPicker label="Persona to make" personas={pool.personas} value={target} onChange={(p) => update({ target: p })} />
        </Field>
        {target ? (
          <Field
            label="Skills it should have"
            hint={
              target.cannotInherit
                ? `Can't inherit ${target.cannotInherit.map((t) => SKILL_TYPE_LABEL[t]).join(", ")}`
                : undefined
            }
          >
            <SkillPicker target={target} available={available} value={skills} onChange={(s) => update({ skills: s })} />
          </Field>
        ) : null}
      </div>

      {!target ? (
        <p className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          Choose a persona, then the skills you want it to have. You&apos;ll get the fusions to make it.
        </p>
      ) : (
        <section className={cn("space-y-6 transition-opacity", pending && "opacity-50")} aria-live="polite" aria-busy={pending}>
          <header className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
            <div className="space-y-1.5">
              <h2 className="font-heading text-3xl font-extrabold uppercase italic leading-none tracking-tight">
                {target.name}
              </h2>
              <div className="flex items-center gap-3">
                <ArcanaBadge arcana={target.arcana} />
                <span className="font-heading text-lg font-bold italic text-p3r-yellow">Lv {target.level}</span>
                {target.unlock ? <span className="text-xs text-muted-foreground">{target.unlock}</span> : null}
              </div>
            </div>
            {result && result.paths.length > 1 ? (
              <div className="flex items-center gap-1" role="tablist" aria-label="Alternative paths">
                <span className="mr-1 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Path</span>
                {result.paths.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === choice}
                    onClick={() => setChoice(i)}
                    className={cn(
                      "clip-slant h-8 min-w-9 px-2.5 font-heading text-sm font-bold uppercase transition-colors",
                      i === choice ? "bg-p3r-yellow text-p3r-black" : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            ) : null}
          </header>

          {result?.failure ? (
            <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
              {describeFailure(result.failure, target)}
            </p>
          ) : path ? (
            <FusionPathView path={path} />
          ) : null}

          {skills.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Inheritance limits follow the Persona 3 rule (more ingredient skills → more inherited). Skill cards can
              fill in anything a path can&apos;t carry.
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-heading text-sm font-bold uppercase tracking-wider text-p3r-blue-light">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}
