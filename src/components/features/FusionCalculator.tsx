"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ArcanaBadge } from "@/components/icons/ArcanaBadge";
import { getPersonaBySlug } from "@/lib/game/data";
import { fuse, fuseArcana } from "@/lib/game/fusion";
import type { Persona } from "@/types/game";
import { useDlc } from "./DlcProvider";
import { PersonaPicker } from "./PersonaPicker";

export function FusionCalculator() {
  const { pool } = useDlc();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pick = (key: "a" | "b") => {
    const persona = getPersonaBySlug(params.get(key) ?? "");
    return persona && pool.byName.has(persona.name) ? persona : null;
  };
  const a = pick("a");
  const b = pick("b");

  const setPick = useCallback(
    (key: "a" | "b", persona: Persona | null) => {
      const next = new URLSearchParams(params);
      if (persona) next.set(key, persona.slug);
      else next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const result = useMemo(() => (a && b ? fuse(pool, a, b) : null), [pool, a, b]);
  const isSpecial = !!result?.specialRecipe;

  return (
    <div className="space-y-8">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <PersonaPicker label="First persona" personas={pool.personas} value={a} onChange={(p) => setPick("a", p)} />
        <span className="text-center font-heading text-3xl font-extrabold text-p3r-yellow" aria-hidden>
          +
        </span>
        <PersonaPicker label="Second persona" personas={pool.personas} value={b} onChange={(p) => setPick("b", p)} />
      </div>

      <div className="relative overflow-hidden rounded-md border bg-card/60 p-8 text-center" aria-live="polite">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-64 rotate-12 bg-p3r-blue/40 [clip-path:polygon(20%_0,100%_0,80%_100%,0_100%)]"
        />
        {!a || !b ? (
          <p className="relative text-muted-foreground">Choose two personas to see what they fuse into.</p>
        ) : result ? (
          <div className="relative space-y-3">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {isSpecial ? "Special fusion" : "Result"}
            </p>
            <Link
              href={`/persona/${result.slug}/`}
              className="block font-heading text-5xl font-extrabold uppercase italic tracking-tight hover:text-p3r-yellow"
            >
              {result.name}
            </Link>
            <div className="flex items-center justify-center gap-3">
              <ArcanaBadge arcana={result.arcana} />
              <span className="font-heading text-xl font-bold italic text-p3r-yellow">Lv {result.level}</span>
            </div>
            {result.unlock ? <p className="text-sm text-muted-foreground">Requires: {result.unlock}</p> : null}
          </div>
        ) : (
          <p className="relative text-muted-foreground">{explainNoResult(a, b, pool.chart)}</p>
        )}
      </div>
    </div>
  );
}

function explainNoResult(a: Persona, b: Persona, chart: Parameters<typeof fuseArcana>[0]): string {
  if (a.name === b.name) return "A persona can't be fused with itself.";
  if (!fuseArcana(chart, a.arcana, b.arcana)) return `${a.arcana} and ${b.arcana} can't be fused together.`;
  if (a.arcana === b.arcana) return `No ${a.arcana} persona is low enough to result from these two.`;
  return "No persona results from this pair.";
}
