"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArcanaBadge } from "@/components/icons/ArcanaBadge";
import { ElementIcon } from "@/components/icons/ElementIcon";
import { Input } from "@/components/ui/input";
import { PERSONAS } from "@/lib/game/data";
import { isAvailable } from "@/lib/game/fusion";
import { cn } from "@/lib/utils";
import { ARCANA, ELEMENTS, type Arcana, type Persona } from "@/types/game";
import { AffinityCell } from "./AffinityCell";
import { ArcanaSelect } from "./ArcanaSelect";
import { useDlc } from "./DlcProvider";

type SortKey = "arcana" | "level" | "name";

const compare: Record<SortKey, (a: Persona, b: Persona) => number> = {
  arcana: (a, b) => ARCANA.indexOf(a.arcana) - ARCANA.indexOf(b.arcana) || a.level - b.level,
  level: (a, b) => a.level - b.level || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
};

export function PersonaTable() {
  const { enabled } = useDlc();
  const [query, setQuery] = useState("");
  const [arcana, setArcana] = useState<Arcana | null>(null);
  const [sort, setSort] = useState<SortKey>("arcana");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PERSONAS.filter(
      (p) =>
        isAvailable(p, enabled) &&
        (!arcana || p.arcana === arcana) &&
        (!q || p.name.toLowerCase().includes(q) || p.skills.some((s) => s.name.toLowerCase().includes(q))),
    ).sort(compare[sort]);
  }, [query, arcana, sort, enabled]);

  const header = (key: SortKey, label: string, className?: string) => (
    <th className={cn("px-3 py-2 font-medium", className)} aria-sort={sort === key ? "ascending" : undefined}>
      <button
        type="button"
        onClick={() => setSort(key)}
        className={cn("uppercase tracking-wider hover:text-foreground", sort === key && "text-p3r-cyan")}
      >
        {label}
      </button>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="search"
          value={query}
          maxLength={40}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search personas or skills…"
          aria-label="Search personas or skills"
          className="h-10 sm:max-w-xs"
        />
        <ArcanaSelect value={arcana} onChange={setArcana} />
        <p className="text-sm text-muted-foreground sm:ml-auto sm:self-center" aria-live="polite">
          {rows.length} personas
        </p>
      </div>

      <div className="overflow-hidden rounded-md border bg-card/60">
        <table className="w-full text-sm">
          <thead className="border-b text-left font-heading text-xs text-muted-foreground">
            <tr>
              {header("level", "Lv", "w-14 text-right")}
              {header("name", "Name")}
              {header("arcana", "Arcana", "hidden sm:table-cell")}
              {ELEMENTS.map((el) => (
                <th key={el} className="hidden w-11 py-2 text-center lg:table-cell">
                  <ElementIcon type={el} className="mx-auto" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.name} className="group border-b border-border/50 last:border-0 hover:bg-accent/40">
                <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{p.level}</td>
                <td className="px-3 py-2">
                  <Link href={`/persona/${p.slug}/`} className="font-medium group-hover:text-p3r-cyan">
                    {p.name}
                  </Link>
                  {p.dlc ? <span className="ml-2 text-[10px] font-bold tracking-wider text-p3r-red">DLC</span> : null}
                  <span className="mt-0.5 block text-xs text-muted-foreground sm:hidden">{p.arcana}</span>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  <ArcanaBadge arcana={p.arcana} />
                </td>
                {ELEMENTS.map((el) => (
                  <td key={el} className="hidden py-2 text-center lg:table-cell">
                    <AffinityCell affinity={p.affinities[el]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="p-8 text-center text-muted-foreground">No personas match.</p> : null}
      </div>
    </div>
  );
}
