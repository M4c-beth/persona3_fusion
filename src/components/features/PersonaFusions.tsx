"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { getPersona } from "@/lib/game/data";
import { fusionsFrom, isAvailable, missingIngredients, recipesFor } from "@/lib/game/fusion";
import { cn } from "@/lib/utils";
import type { Persona } from "@/types/game";
import { useDlc } from "./DlcProvider";
import { PersonaLink } from "./PersonaLink";

const PAGE = 30;

type Tab = "recipes" | "fusions";

export function PersonaFusions({ persona }: { persona: Persona }) {
  const { pool, enabled } = useDlc();
  const [tab, setTab] = useState<Tab>(persona.specialRecipe ? "fusions" : "recipes");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const available = isAvailable(persona, enabled);
  const recipes = useMemo(() => recipesFor(pool, persona), [pool, persona]);
  const fusions = useMemo(
    () => fusionsFrom(pool, persona).sort((x, y) => x.result.level - y.result.level || x.partner.level - y.partner.level),
    [pool, persona],
  );

  const q = query.trim().toLowerCase();
  const rows =
    tab === "recipes"
      ? recipes
          .filter(({ a, b }) => !q || a.name.toLowerCase().includes(q) || b.name.toLowerCase().includes(q))
          .map(({ a, b }) => ({ key: `${a.name}+${b.name}`, left: a, right: b, op: "+" }))
      : fusions
          .filter(({ partner, result }) => !q || partner.name.toLowerCase().includes(q) || result.name.toLowerCase().includes(q))
          .map(({ partner, result }) => ({ key: partner.name, left: partner, right: result, op: "→" }));

  if (!available) {
    return (
      <Notice>
        {persona.name} is in the <strong className="text-p3r-gold">{persona.dlc}</strong>. Turn it on from the DLC
        menu to see its fusions.
      </Notice>
    );
  }

  const tabButton = (value: Tab, label: string, count: number) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === value}
      onClick={() => {
        setTab(value);
        setLimit(PAGE);
      }}
      className={cn(
        "clip-slant px-4 py-1.5 font-heading text-sm font-bold uppercase tracking-wider transition-colors",
        tab === value ? "bg-p3r-yellow text-p3r-black" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );

  return (
    <section className="space-y-4">
      {persona.specialRecipe ? <SpecialRecipe persona={persona} missing={missingIngredients(pool, persona)} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="tablist" className="flex gap-1">
          {persona.specialRecipe ? null : tabButton("recipes", "Recipes", recipes.length)}
          {tabButton("fusions", "Fuses into", fusions.length)}
        </div>
        <Input
          type="search"
          value={query}
          maxLength={40}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by persona…"
          aria-label="Filter fusions by persona"
          className="h-9 sm:ml-auto sm:max-w-56"
        />
      </div>

      {rows.length === 0 ? (
        <Notice>{q ? "Nothing matches that filter." : "No normal fusion makes this persona."}</Notice>
      ) : (
        <>
          <ul className="divide-y divide-border/50 rounded-md border bg-card/60">
            {rows.slice(0, limit).map(({ key, left, right, op }) => (
              <li key={key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-2 text-sm">
                <PersonaLink persona={left} />
                <span className="font-heading font-bold text-p3r-yellow">{op}</span>
                <PersonaLink persona={right} />
              </li>
            ))}
          </ul>
          {rows.length > limit ? (
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Show more ({rows.length - limit} left)
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

function SpecialRecipe({ persona, missing }: { persona: Persona; missing: string[] }) {
  const ingredients = (persona.specialRecipe ?? []).map((name) => getPersona(name)).filter((p) => p !== undefined);
  return (
    <div className="rounded-md border border-p3r-gold/40 bg-p3r-gold/5 p-4">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-p3r-gold">Special fusion</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Only made by fusing these {ingredients.length} personas together.
      </p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {ingredients.map((p) => (
          <li key={p.name} className={cn("text-sm", missing.includes(p.name) && "opacity-50")}>
            <PersonaLink persona={p} />
            {missing.includes(p.name) ? <span className="ml-2 text-xs text-p3r-gold">needs {p.dlc}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
