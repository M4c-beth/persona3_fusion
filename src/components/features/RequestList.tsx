"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { REQUESTS, requestUnlock } from "@/lib/game/companions";
import { getPersona, getSkill } from "@/lib/game/data";
import { cn } from "@/lib/utils";
import { REQUEST_CATEGORIES, type ElizabethRequest, type RequestCategory } from "@/types/game";

const CATEGORY_LABEL: Record<RequestCategory, string> = {
  item: "Items",
  fusion: "Fusion",
  tartarus: "Tartarus",
  milestone: "Milestones",
  errand: "Errands",
  date: "Dates",
};

function plannerHref({ persona, skills }: NonNullable<ElizabethRequest["link"]>): string | null {
  const target = persona ? getPersona(persona) : undefined;
  if (!target) return null;
  const s = (skills ?? []).map((name) => getSkill(name)?.slug).filter(Boolean);
  return `/fusion/?t=${target.slug}${s.length ? `&s=${s.join(",")}` : ""}`;
}

function RequestActions({ request }: { request: ElizabethRequest }) {
  const { link } = request;
  const unlock = requestUnlock(request.number);
  const planner = link ? plannerHref(link) : null;
  const skillOnly = link && !link.persona ? link.skills : undefined;
  if (!planner && !skillOnly && !unlock) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {planner ? (
        <Link href={planner} className="font-semibold text-p3r-cyan hover:text-p3r-white">
          Plan in Fusion →
        </Link>
      ) : null}
      {skillOnly?.map((name) => (
        <Link key={name} href={`/skills/?q=${encodeURIComponent(name)}`} className="font-semibold text-p3r-cyan hover:text-p3r-white">
          Who learns {name} →
        </Link>
      ))}
      {unlock ? (
        <Link href={`/persona/${unlock.slug}/`} className="text-p3r-sky hover:text-p3r-white">
          Reward unlocks {unlock.name} for fusion
        </Link>
      ) : null}
    </div>
  );
}

export function RequestList() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<RequestCategory | null>(null);
  const [missableOnly, setMissableOnly] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REQUESTS.filter(
      (r) =>
        (!category || r.category === category) &&
        (!missableOnly || r.deadline || r.note?.startsWith("Missable")) &&
        (!q || `${r.number} ${r.title} ${r.task} ${r.reward}`.toLowerCase().includes(q)),
    );
  }, [query, category, missableOnly]);

  const chip = (value: RequestCategory | null, label: string) => (
    <button
      key={label}
      type="button"
      aria-pressed={category === value}
      onClick={() => setCategory(value)}
      className={cn(
        "clip-slant px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition-colors",
        category === value ? "bg-p3r-white text-p3r-navy" : "bg-secondary text-muted-foreground hover:text-p3r-white",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          type="search"
          value={query}
          maxLength={40}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search requests, items or rewards…"
          aria-label="Search requests"
          className="h-10 lg:max-w-xs"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by type">
          {chip(null, "All")}
          {REQUEST_CATEGORIES.map((c) => chip(c, CATEGORY_LABEL[c]))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground lg:ml-auto">
          <Switch checked={missableOnly} onCheckedChange={(on) => setMissableOnly(on)} />
          Missable only
        </label>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {rows.length} of {REQUESTS.length} requests
      </p>

      <ol className="space-y-2">
        {rows.map((r) => (
          <li key={r.number} className="grid gap-1 border bg-card p-4 sm:grid-cols-[3.5rem_1fr] sm:gap-3">
            <span className="display text-xl text-p3r-cyan/80 sm:text-3xl">#{r.number}</span>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-semibold text-p3r-white">{r.title}</h2>
                <span className="text-xs text-muted-foreground">
                  From {r.available}
                  {r.deadline ? <span className="font-semibold text-p3r-red"> · due {r.deadline}</span> : null}
                  {r.requires ? ` · after #${r.requires.join(", #")}` : null}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{r.task}</p>
              {r.note ? <p className="text-xs text-p3r-sky">{r.note}</p> : null}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Reward</span>
                  <span className="bg-secondary px-2 py-0.5">{r.reward}</span>
                </span>
                <RequestActions request={r} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {rows.length === 0 ? <p className="p-8 text-center text-muted-foreground">No requests match.</p> : null}
    </div>
  );
}
