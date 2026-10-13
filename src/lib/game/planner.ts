import type { Persona } from "@/types/game";
import { getSkill } from "./data";
import { recipesFor, type FusionPool } from "./fusion";
import { inheritBlock, inheritLimit, MAX_SKILLS, type InheritBlock } from "./inheritance";

export interface SkillAssignment {
  name: string;
  /** "native": the persona learns it (at `level`, 0 = innate); "inherited": passed on by an ingredient. */
  source: "native" | "inherited";
  level?: number;
}

/** One persona in a fusion path. Leaves have no ingredients: get them however you like. */
export interface PlanStep {
  persona: Persona;
  skills: SkillAssignment[];
  ingredients?: PlanStep[];
  special?: boolean;
}

export type PlanFailure =
  | { kind: "blocked"; skill: string; reason: InheritBlock }
  | { kind: "too-many-inherited"; count: number; max: number }
  | { kind: "too-many-skills"; count: number }
  | { kind: "no-recipe" }
  | { kind: "not-found" };

export type PlanResult = { paths: PlanStep[]; failure?: undefined } | { paths: []; failure: PlanFailure };

export interface PlanOptions {
  /** How many fusions deep a skill may be carried. */
  maxDepth?: number;
  maxPaths?: number;
  /** Recipes tried per persona. */
  branch?: number;
  /** Hard cap on recipe expansions per search. */
  budget?: number;
}

const MAX_INHERITED = 6;

interface Context {
  pool: FusionPool;
  branch: number;
  budget: number;
  memo: Map<string, PlanStep | null>;
}

function nativeLevels(persona: Persona): Map<string, number> {
  return new Map(persona.skills.filter((s) => !s.fusionSpell).map((s) => [s.name, s.level]));
}

function canPersonaInherit(persona: Persona, skillName: string): boolean {
  const skill = getSkill(skillName);
  return !!skill && inheritBlock(persona, skill) === null;
}

/** A persona used as-is; every skill in `skills` is one it learns. */
function leaf(persona: Persona, skills: string[]): PlanStep {
  return {
    persona,
    skills: persona.skills
      .filter((s) => !s.fusionSpell && skills.includes(s.name))
      .map((s) => ({ name: s.name, source: "native", level: s.level })),
  };
}

/** Skills a persona knows when used as an ingredient in this plan. */
function knownSkillCount(step: PlanStep): number {
  const inherited = step.skills.filter((s) => s.source === "inherited").length;
  const learnedBy = Math.max(step.persona.level, ...step.skills.map((s) => s.level ?? 0));
  const native = step.persona.skills.filter((s) => !s.fusionSpell && s.level <= learnedBy).length;
  return native + inherited;
}

function ingredientSets(ctx: Context, persona: Persona, need: string[]): Persona[][] {
  let sets: Persona[][];
  if (persona.specialRecipe) {
    const ingredients = persona.specialRecipe.map((n) => ctx.pool.byName.get(n));
    sets = ingredients.every((p) => p !== undefined) ? [ingredients as Persona[]] : [];
  } else {
    sets = recipesFor(ctx.pool, persona).map(({ a, b }) => [a, b]);
  }
  if (need.length === 0) return sets;
  const coverage = (set: Persona[]) => need.filter((s) => set.some((p) => nativeLevels(p).has(s))).length;
  // Stable sort keeps the cheapest recipes first among equal coverage.
  return sets
    .map((set) => ({ set, score: coverage(set) }))
    .sort((x, y) => y.score - x.score)
    .map(({ set }) => set);
}

const MAX_SPLITS = 64;

/**
 * Ways to hand `rest` to ingredients that can inherit them: one carrier first,
 * then splits across several. Large special recipes only try single carriers.
 */
function splitCarried(ingredients: Persona[], rest: string[]): Map<Persona, string[]>[] {
  if (rest.length === 0) return [new Map()];
  const options = rest.map((s) => ingredients.filter((p) => canPersonaInherit(p, s)));
  if (options.some((o) => o.length === 0)) return [];

  const singles = ingredients
    .filter((p) => options.every((o) => o.includes(p)))
    .map((p) => new Map([[p, [...rest]]]));
  if (ingredients.length ** rest.length > MAX_SPLITS) return singles;

  const splits: Map<Persona, string[]>[] = [];
  const walk = (i: number, current: Map<Persona, string[]>) => {
    if (i === rest.length) {
      if (current.size > 1) splits.push(new Map([...current].map(([p, s]) => [p, [...s]])));
      return;
    }
    for (const p of options[i]) {
      current.set(p, [...(current.get(p) ?? []), rest[i]]);
      walk(i + 1, current);
      const left = current.get(p)!.slice(0, -1);
      if (left.length) current.set(p, left);
      else current.delete(p);
    }
  };
  walk(0, new Map());
  return [...singles, ...splits];
}

/** Fuse `persona` from `ingredients` so it ends up holding `skills`. */
function expand(ctx: Context, persona: Persona, skills: string[], ingredients: Persona[], depth: number): PlanStep | null {
  if (ctx.budget-- <= 0) return null;
  const native = nativeLevels(persona);
  // Callers have already checked `persona` can inherit every skill in `need`.
  const need = skills.filter((s) => !native.has(s));

  const assigned = new Map<Persona, string[]>(ingredients.map((p) => [p, []]));
  const rest: string[] = [];
  for (const skill of need) {
    const holder = ingredients
      .filter((p) => nativeLevels(p).has(skill))
      .sort((x, y) => nativeLevels(x).get(skill)! - nativeLevels(y).get(skill)!)[0];
    if (holder) assigned.get(holder)!.push(skill);
    else rest.push(skill);
  }

  // Skills no ingredient learns are carried in by ingredients that are themselves fused.
  for (const split of splitCarried(ingredients, rest)) {
    const children: PlanStep[] = [];
    for (const p of ingredients) {
      const own = assigned.get(p)!;
      const extra = split.get(p);
      const child = extra ? carry(ctx, p, [...own, ...extra], depth - 1) : leaf(p, own);
      if (!child) break;
      children.push(child);
    }
    if (children.length !== ingredients.length) continue;
    const total = children.reduce((sum, c) => sum + knownSkillCount(c), 0);
    if (inheritLimit(total) < need.length) continue;

    return {
      persona,
      skills: skills.map((name) =>
        native.has(name) ? { name, source: "native", level: native.get(name) } : { name, source: "inherited" },
      ),
      ingredients: children,
      special: !!persona.specialRecipe,
    };
  }
  return null;
}

/**
 * Cheapest way to fuse `persona` holding `skills` (at least one of which it doesn't learn),
 * or null within the depth/budget.
 */
function carry(ctx: Context, persona: Persona, skills: string[], depth: number): PlanStep | null {
  const native = nativeLevels(persona);
  const need = skills.filter((s) => !native.has(s));
  if (depth <= 0 || !need.every((s) => canPersonaInherit(persona, s))) return null;

  const key = `${persona.name}|${[...skills].sort().join(",")}|${depth}`;
  const cached = ctx.memo.get(key);
  if (cached !== undefined) return cached;

  let found: PlanStep | null = null;
  for (const set of ingredientSets(ctx, persona, need).slice(0, ctx.branch)) {
    found = expand(ctx, persona, skills, set, depth);
    if (found) break;
  }
  ctx.memo.set(key, found);
  return found;
}

/**
 * Fusion paths that create `target` holding every skill in `desired`.
 * Each path is a tree: the target, its ingredients, and how each carried skill reaches it.
 */
export function findFusionPaths(
  pool: FusionPool,
  target: Persona,
  desired: string[],
  { maxDepth = 3, maxPaths = 5, branch = 16, budget = 8_000 }: PlanOptions = {},
): PlanResult {
  const skills = [...new Set(desired)];
  if (skills.length > MAX_SKILLS) return { paths: [], failure: { kind: "too-many-skills", count: skills.length } };

  const native = nativeLevels(target);
  for (const name of skills) {
    const skill = getSkill(name);
    const reason = !skill ? "exclusive" : native.has(name) ? null : inheritBlock(target, skill);
    if (reason) return { paths: [], failure: { kind: "blocked", skill: name, reason } };
  }

  const need = skills.filter((s) => !native.has(s));
  if (need.length > MAX_INHERITED) {
    return { paths: [], failure: { kind: "too-many-inherited", count: need.length, max: MAX_INHERITED } };
  }

  const ctx: Context = { pool, branch, budget, memo: new Map() };
  const sets = ingredientSets(ctx, target, need);
  if (sets.length === 0) return { paths: [], failure: { kind: "no-recipe" } };

  // Each recipe is a different ingredient set, so the paths are distinct.
  const paths: PlanStep[] = [];
  for (const set of sets.slice(0, branch * 2)) {
    const path = expand(ctx, target, skills, set, maxDepth);
    if (path) paths.push(path);
    if (paths.length >= maxPaths) break;
  }
  return paths.length ? { paths } : { paths: [], failure: { kind: "not-found" } };
}

/** A path as ordered steps: personas to get first, then each fusion bottom-up. */
export function flattenPath(path: PlanStep): { obtain: PlanStep[]; fusions: PlanStep[] } {
  const obtain: PlanStep[] = [];
  const fusions: PlanStep[] = [];
  const visit = (step: PlanStep) => {
    if (!step.ingredients) {
      obtain.push(step);
      return;
    }
    step.ingredients.forEach(visit);
    fusions.push(step);
  };
  visit(path);
  return { obtain, fusions };
}
