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
  /** Longest chain of fusions used to carry skills into one ingredient. */
  maxChain?: number;
}

const MAX_INHERITED = 6;

/**
 * A persona holding a set of the wanted skills (bitmask), reached after `dist` fusions.
 * `prev` is the fusion that made it: a carrier state plus leaf partners.
 */
interface State {
  persona: Persona;
  mask: number;
  dist: number;
  prev?: { carrier: State; partners: Persona[]; special: boolean };
}

interface Search {
  pool: FusionPool;
  skills: string[];
  nativeMask: (p: Persona) => number;
  holdable: (p: Persona) => number;
  knownCount: (p: Persona, mask: number) => number;
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

function createSearch(pool: FusionPool, skills: string[]): Search {
  const bits = new Map(skills.map((s, i) => [s, 1 << i]));
  const memo = new Map<string, { native: number; holdable: number }>();
  const masks = (p: Persona) => {
    let m = memo.get(p.name);
    if (!m) {
      let native = 0;
      let holdable = 0;
      for (const s of p.skills) if (!s.fusionSpell && bits.has(s.name)) native |= bits.get(s.name)!;
      skills.forEach((name, i) => {
        const skill = getSkill(name)!;
        if (native & (1 << i) || inheritBlock(p, skill) === null) holdable |= 1 << i;
      });
      memo.set(p.name, (m = { native, holdable }));
    }
    return m;
  };
  return {
    pool,
    skills,
    nativeMask: (p) => masks(p).native,
    holdable: (p) => masks(p).holdable,
    /** Skills the persona knows when used: its own up to the levels it must reach, plus inherited ones. */
    knownCount: (p, mask) => {
      const native = masks(p).native;
      const learnTo = Math.max(
        p.level,
        ...p.skills.filter((s) => !s.fusionSpell && bits.has(s.name) && mask & bits.get(s.name)!).map((s) => s.level),
      );
      return p.skills.filter((s) => !s.fusionSpell && s.level <= learnTo).length + popcount(mask & ~native);
    },
  };
}

/** Breadth-first: shortest fusion chains that put each combination of skills on each persona. */
function exploreChains(search: Search, maxChain: number): Map<string, State[]> {
  const { pool, nativeMask, holdable, knownCount } = search;
  const byPersona = new Map<string, State[]>();
  const queue: State[] = [];

  const add = (state: State) => {
    const list = byPersona.get(state.persona.name) ?? [];
    // Skip if this persona already holds a superset of these skills in as few fusions.
    if (list.some((s) => (s.mask & state.mask) === state.mask)) return;
    list.push(state);
    byPersona.set(state.persona.name, list);
    queue.push(state);
  };

  for (const persona of pool.personas) {
    const mask = nativeMask(persona);
    if (mask) add({ persona, mask, dist: 0 });
  }

  const specials = pool.personas.filter((p) => p.specialRecipe?.every((n) => pool.byName.has(n)));

  const step = (carrier: State, partners: Persona[], result: Persona, special: boolean) => {
    const carried = partners.reduce((m, p) => m | nativeMask(p), carrier.mask);
    if ((carried & ~holdable(result)) !== 0) return;
    const inherited = popcount(carried & ~nativeMask(result));
    const total = partners.reduce((n, p) => n + knownCount(p, nativeMask(p)), knownCount(carrier.persona, carrier.mask));
    if (inherited > inheritLimit(total)) return;
    add({
      persona: result,
      mask: carried | nativeMask(result),
      dist: carrier.dist + 1,
      prev: { carrier, partners, special },
    });
  };

  for (let i = 0; i < queue.length; i++) {
    const state = queue[i];
    if (state.dist >= maxChain) continue;
    for (const { partner, result } of partnersOf(pool, state.persona)) step(state, [partner], result, false);
    for (const special of specials) {
      const recipe = special.specialRecipe!;
      if (!recipe.includes(state.persona.name)) continue;
      const others = recipe.filter((n) => n !== state.persona.name).map((n) => pool.byName.get(n)!);
      step(state, others, special, true);
    }
  }
  return byPersona;
}

function skillList(search: Search, persona: Persona, mask: number): SkillAssignment[] {
  const levels = new Map(persona.skills.filter((s) => !s.fusionSpell).map((s) => [s.name, s.level]));
  return search.skills
    .filter((_, i) => mask & (1 << i))
    .map((name) =>
      levels.has(name) ? { name, source: "native", level: levels.get(name) } : { name, source: "inherited" },
    );
}

function toStep(search: Search, state: State): PlanStep {
  const skills = skillList(search, state.persona, state.mask);
  if (!state.prev) return { persona: state.persona, skills };
  const { carrier, partners, special } = state.prev;
  const steps = [toStep(search, carrier), ...partners.map((p) => toStep(search, { persona: p, mask: search.nativeMask(p), dist: 0 }))];
  const order = special ? state.persona.specialRecipe! : null;
  const ingredients = order
    ? order.map((name) => steps.find((s) => s.persona.name === name)!)
    : steps.sort((a, b) => a.persona.level - b.persona.level);
  return { persona: state.persona, skills, ingredients, special };
}

interface Candidate {
  ingredients: State[];
  fusions: number;
}

/** Cheapest pick of chain states per ingredient that together carry every wanted skill. */
function bestPick(search: Search, chains: Map<string, State[]>, ingredients: Persona[], full: number): Candidate | null {
  type Entry = { fusions: number; picks: State[] };
  let combos = new Map<number, Entry>([[0, { fusions: 0, picks: [] }]]);
  for (const ingredient of ingredients) {
    const leaf: State = { persona: ingredient, mask: search.nativeMask(ingredient), dist: 0 };
    const options = [leaf, ...(chains.get(ingredient.name) ?? []).filter((s) => s.dist > 0)];
    const next = new Map<number, Entry>();
    for (const [mask, entry] of combos) {
      for (const option of options) {
        const m = (mask | option.mask) & full;
        const fusions = entry.fusions + option.dist;
        const existing = next.get(m);
        if (!existing || fusions < existing.fusions) next.set(m, { fusions, picks: [...entry.picks, option] });
      }
    }
    combos = next;
  }
  const best = combos.get(full);
  return best ? { ingredients: best.picks, fusions: best.fusions + 1 } : null;
}

/**
 * Fusion paths that create `target` holding every skill in `desired`, fewest fusions first.
 * Skills the target doesn't learn are carried in through chains of fusions, each of which
 * must be able to inherit them, within the inheritance limit.
 */
export function findFusionPaths(
  pool: FusionPool,
  target: Persona,
  desired: string[],
  { maxPaths = 5, maxChain = 8 }: PlanOptions = {},
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

  const search = createSearch(pool, need);
  const chains = need.length ? exploreChains(search, maxChain) : new Map<string, State[]>();
  const full = (1 << need.length) - 1;

  const candidates: Candidate[] = [];
  for (const ingredients of recipes) {
    const pick = bestPick(search, chains, ingredients, full);
    if (!pick) continue;
    const total = pick.ingredients.reduce((n, s) => n + search.knownCount(s.persona, s.mask), 0);
    if (inheritLimit(total) < need.length) continue;
    candidates.push(pick);
  }
  if (candidates.length === 0) return { paths: [], failure: { kind: "not-found" } };

  // Recipes arrive cheapest first; a stable sort keeps that order among equal fusion counts.
  candidates.sort((a, b) => a.fusions - b.fusions);
  const paths = candidates.slice(0, maxPaths).map(({ ingredients }) => {
    const steps = ingredients.map((s) => toStep(search, s));
    return {
      persona: target,
      skills: wanted.map((name): SkillAssignment =>
        targetNative.has(name)
          ? { name, source: "native", level: targetNative.get(name) }
          : { name, source: "inherited" },
      ),
      ingredients: steps,
      special: !!target.specialRecipe,
    };
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
