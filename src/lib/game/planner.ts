import type { Persona } from "@/types/game";
import { getSkill } from "./data";
import { fusionsFrom, recipesFor, type FusionPool } from "./fusion";
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
  /** Level to reach before using it (to learn a skill, or to know enough skills to pass them on). */
  levelTo?: number;
}

export type PlanFailure =
  | { kind: "blocked"; skill: string; reason: InheritBlock }
  | { kind: "too-many-inherited"; count: number; max: number }
  | { kind: "too-many-skills"; count: number }
  | { kind: "no-recipe" }
  | { kind: "not-found" };

export type PlanResult = { paths: PlanStep[]; failure?: undefined } | { paths: []; failure: PlanFailure };

export interface PlanOptions {
  maxPaths?: number;
  /** Most fusions a whole path may take. */
  maxFusions?: number;
}

const MAX_INHERITED = 6;
/** Alternatives kept per skill combination when assembling the final fusion. */
const KEEP_PER_MASK = 3;

/**
 * A persona holding some of the wanted skills (bitmask), built with `cost` fusions.
 * Leaves cost nothing; `levelTo` is the level it's used at.
 */
interface State {
  persona: Persona;
  mask: number;
  cost: number;
  levelTo: number;
  /** Skills it knows when used as an ingredient (cached). */
  known?: number;
  parts?: State[];
  special?: boolean;
}

const popcount = (n: number) => {
  let c = 0;
  for (let x = n; x; x &= x - 1) c++;
  return c;
};

const partnerCache = new WeakMap<FusionPool, Map<string, { partner: Persona; result: Persona }[]>>();

function partnersOf(pool: FusionPool, persona: Persona) {
  let cache = partnerCache.get(pool);
  if (!cache) partnerCache.set(pool, (cache = new Map()));
  let list = cache.get(persona.name);
  if (!list) cache.set(persona.name, (list = fusionsFrom(pool, persona)));
  return list;
}

class Search {
  private bits: Map<string, number>;
  private memo = new Map<string, { native: number; holdable: number; nativeLevel: number; leaves: State[] }>();

  constructor(
    readonly pool: FusionPool,
    readonly skills: string[],
  ) {
    this.bits = new Map(skills.map((s, i) => [s, 1 << i]));
  }

  private info(p: Persona) {
    let m = this.memo.get(p.name);
    if (!m) {
      let native = 0;
      let holdable = 0;
      let nativeLevel = p.level;
      for (const s of p.skills) {
        const bit = this.bits.get(s.name);
        if (s.fusionSpell || bit === undefined) continue;
        native |= bit;
        nativeLevel = Math.max(nativeLevel, s.level);
      }
      this.skills.forEach((name, i) => {
        if (native & (1 << i) || inheritBlock(p, getSkill(name)!) === null) holdable |= 1 << i;
      });
      const maxLevel = Math.max(p.level, ...p.skills.filter((s) => !s.fusionSpell).map((s) => s.level));
      // As found, and levelled until it knows all its own skills (more skills → more inherited).
      const leaves: State[] = [{ persona: p, mask: native, cost: 0, levelTo: nativeLevel }];
      if (maxLevel > nativeLevel) leaves.push({ persona: p, mask: native, cost: 0, levelTo: maxLevel });
      this.memo.set(p.name, (m = { native, holdable, nativeLevel, leaves }));
    }
    return m;
  }

  native = (p: Persona) => this.info(p).native;
  leaves = (p: Persona) => this.info(p).leaves;

  /** Skills the state's persona knows when it's used as an ingredient. */
  knownCount(state: State): number {
    if (state.known === undefined) {
      const own = state.persona.skills.filter((s) => !s.fusionSpell && s.level <= state.levelTo).length;
      state.known = own + popcount(state.mask & ~this.info(state.persona).native);
    }
    return state.known;
  }

  /** Fuse `parts` into `result`, or null if it can't hold or inherit their skills. */
  combine(parts: State[], result: Persona, special: boolean): State | null {
    const { native, holdable, nativeLevel } = this.info(result);
    let carried = 0;
    for (const p of parts) carried |= p.mask;
    if ((carried & ~holdable) !== 0) return null;
    const inherited = popcount(carried & ~native);
    const total = parts.reduce((n, p) => n + this.knownCount(p), 0);
    if (inherited > inheritLimit(total)) return null;
    return {
      persona: result,
      mask: carried | native,
      cost: parts.reduce((n, p) => n + p.cost, 0) + 1,
      levelTo: nativeLevel,
      parts,
      special,
    };
  }

  /** Skills listed on a step: `required` ones, native or inherited. */
  skillList(persona: Persona, required: number): SkillAssignment[] {
    const levels = new Map(persona.skills.filter((s) => !s.fusionSpell).map((s) => [s.name, s.level]));
    return this.skills
      .filter((_, i) => required & (1 << i))
      .map((name) =>
        levels.has(name) ? { name, source: "native", level: levels.get(name) } : { name, source: "inherited" },
      );
  }
}

/**
 * Cheapest-first search over fusion trees: every way to put each combination of wanted
 * skills on each persona, any number of fusions deep. After each cost layer,
 * `afterLayer` returns the most fusions an ingredient may still be worth.
 */
function explore(search: Search, done: Map<string, State[]>, bound: number, afterLayer: () => number): void {
  const { pool } = search;
  const buckets: State[][] = [];
  const dominated = (s: State) =>
    (done.get(s.persona.name) ?? []).some(
      (d) => (d.mask & s.mask) === s.mask && d.cost <= s.cost && search.knownCount(d) >= search.knownCount(s),
    );
  const push = (s: State) => {
    if (s.cost > bound || dominated(s)) return;
    while (buckets.length <= s.cost) buckets.push([]);
    buckets[s.cost].push(s);
  };

  for (const p of pool.personas) for (const leaf of search.leaves(p)) if (leaf.mask) push(leaf);
  const specials = pool.personas.filter((p) => p.specialRecipe?.every((n) => pool.byName.has(n)));

  for (let cost = 0; cost < buckets.length && cost <= bound; cost++) {
    for (const state of buckets[cost]) {
      if (dominated(state)) continue;
      const list = done.get(state.persona.name) ?? [];
      list.push(state);
      done.set(state.persona.name, list);

      for (const { partner, result } of partnersOf(pool, state.persona)) {
        for (const other of [...search.leaves(partner), ...(done.get(partner.name) ?? [])]) {
          const next = search.combine([state, other], result, false);
          if (next && next.mask) push(next);
        }
      }
      for (const special of specials) {
        if (!special.specialRecipe!.includes(state.persona.name)) continue;
        const others = special.specialRecipe!.filter((n) => n !== state.persona.name).map((n) => pool.byName.get(n)!);
        for (const level of [0, -1]) {
          // Other ingredients as found, then levelled up.
          const parts = [state, ...others.map((o) => search.leaves(o).at(level)!)];
          const next = search.combine(parts, special, true);
          if (next) {
            push(next);
            break;
          }
        }
      }
    }
    bound = Math.min(bound, afterLayer());
  }
}

interface Candidate {
  parts: State[];
  cost: number;
}

/** Cheapest states per ingredient that together carry every wanted skill into the target. */
function assemble(search: Search, done: Map<string, State[]>, target: Persona, ingredients: Persona[], full: number) {
  type Entry = { cost: number; parts: State[] };
  let combos = new Map<number, Entry[]>([[0, [{ cost: 0, parts: [] }]]]);
  for (const ingredient of ingredients) {
    const options = [...search.leaves(ingredient), ...(done.get(ingredient.name) ?? []).filter((s) => s.cost > 0)];
    const next = new Map<number, Entry[]>();
    for (const [mask, entries] of combos) {
      for (const entry of entries) {
        for (const option of options) {
          const m = (mask | option.mask) & full;
          const list = next.get(m) ?? [];
          list.push({ cost: entry.cost + option.cost, parts: [...entry.parts, option] });
          next.set(m, list);
        }
      }
    }
    for (const [m, list] of next) next.set(m, list.sort((a, b) => a.cost - b.cost).slice(0, KEEP_PER_MASK));
    combos = next;
  }
  for (const entry of combos.get(full) ?? []) {
    const built = search.combine(entry.parts, target, !!target.specialRecipe);
    if (built) return { parts: entry.parts, cost: built.cost } satisfies Candidate;
  }
  return null;
}

/** Turn a state into steps, keeping only the skills its parent actually needs from it. */
function toStep(search: Search, state: State, required: number): PlanStep {
  const native = search.native(state.persona);
  const usedNative = state.persona.skills
    .filter((s) => !s.fusionSpell && search.skills.includes(s.name) && required & (1 << search.skills.indexOf(s.name)))
    .map((s) => s.level);
  const needsKnowledge = state.parts === undefined && state.levelTo > Math.max(state.persona.level, ...usedNative);
  const levelTo = Math.max(state.persona.level, ...usedNative, needsKnowledge ? state.levelTo : 0);
  const step: PlanStep = { persona: state.persona, skills: search.skillList(state.persona, required) };
  if (levelTo > state.persona.level) step.levelTo = levelTo;

  // Ingredients that carry nothing needed are just used as found.
  if (!state.parts || (required & ~native) === 0) return step;

  let remaining = required & ~native;
  const childNeeds = state.parts.map((part) => {
    const take = part.mask & remaining;
    remaining &= ~take;
    return take;
  });
  // A fused ingredient whose skills aren't needed here comes back as a plain persona.
  const children = state.parts.map((part, i) => toStep(search, part, childNeeds[i]));
  step.ingredients = state.special
    ? state.persona.specialRecipe!.map((name) => children.find((c) => c.persona.name === name)!)
    : children.sort((a, b) => a.persona.level - b.persona.level);
  step.special = state.special;
  return step;
}

/**
 * Fusion paths that create `target` holding every skill in `desired`, fewest fusions first.
 * Skills the target doesn't learn are passed along chains of fusions of any length; every
 * persona in a chain must be able to inherit what it carries, within the inheritance limit.
 */
export function findFusionPaths(
  pool: FusionPool,
  target: Persona,
  desired: string[],
  { maxPaths = 5, maxFusions = 20 }: PlanOptions = {},
): PlanResult {
  const wanted = [...new Set(desired)];
  if (wanted.length > MAX_SKILLS) return { paths: [], failure: { kind: "too-many-skills", count: wanted.length } };

  const targetNative = new Map(target.skills.filter((s) => !s.fusionSpell).map((s) => [s.name, s.level]));
  for (const name of wanted) {
    const skill = getSkill(name);
    const reason = !skill ? "exclusive" : targetNative.has(name) ? null : inheritBlock(target, skill);
    if (reason) return { paths: [], failure: { kind: "blocked", skill: name, reason } };
  }

  const need = wanted.filter((s) => !targetNative.has(s));
  if (need.length > MAX_INHERITED) {
    return { paths: [], failure: { kind: "too-many-inherited", count: need.length, max: MAX_INHERITED } };
  }

  const recipes: Persona[][] = target.specialRecipe
    ? target.specialRecipe.every((n) => pool.byName.has(n))
      ? [target.specialRecipe.map((n) => pool.byName.get(n)!)]
      : []
    : recipesFor(pool, target).map(({ a, b }) => [a, b]);
  if (recipes.length === 0) return { paths: [], failure: { kind: "no-recipe" } };

  const search = new Search(pool, need);
  const full = (1 << need.length) - 1;

  // Explore cost layer by cost layer. A target fusion costs its ingredients' fusions + 1,
  // so once a path of N fusions exists, ingredients costing more than N - 1 can't help.
  const done = new Map<string, State[]>();
  const tryAssemble = () =>
    recipes.flatMap((ingredients) => {
      const c = assemble(search, done, target, ingredients, full);
      return c && c.cost <= maxFusions ? [c] : [];
    });
  let candidates: Candidate[] = [];
  if (need.length === 0) {
    candidates = tryAssemble();
  } else {
    explore(search, done, maxFusions - 1, () => {
      const found = tryAssemble();
      return found.length ? Math.min(...found.map((c) => c.cost)) - 1 : maxFusions - 1;
    });
    candidates = tryAssemble();
  }
  if (candidates.length === 0) return { paths: [], failure: { kind: "not-found" } };

  // Recipes arrive cheapest first; a stable sort keeps that order among equal fusion counts.
  candidates.sort((a, b) => a.cost - b.cost);
  const paths = candidates.slice(0, maxPaths).map(({ parts }) => {
    let remaining = full;
    const steps = parts.map((part) => {
      const take = part.mask & remaining;
      remaining &= ~take;
      return toStep(search, part, take);
    });
    const step: PlanStep = {
      persona: target,
      skills: wanted.map((name): SkillAssignment =>
        targetNative.has(name) ? { name, source: "native", level: targetNative.get(name) } : { name, source: "inherited" },
      ),
      ingredients: target.specialRecipe ? steps : steps.sort((a, b) => a.persona.level - b.persona.level),
      special: !!target.specialRecipe,
    };
    const learnTo = Math.max(0, ...step.skills.map((s) => s.level ?? 0));
    if (learnTo > target.level) step.levelTo = learnTo;
    return step;
  });
  return { paths };
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
