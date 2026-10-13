import type { Arcana, DlcPack, FusionChart, Persona } from "@/types/game";

export interface FusionPair {
  a: Persona;
  b: Persona;
}

/**
 * Personas available for one DLC selection, plus lookup tables for P3R fusion.
 * Build once per selection with createFusionPool and reuse.
 */
export interface FusionPool {
  personas: Persona[];
  chart: FusionChart;
  /** Normal-fusion results per arcana, sorted by level ascending. */
  results: Map<Arcana, Persona[]>;
  /** Two-persona special recipes keyed by pairKey. */
  specialPairs: Map<string, Persona>;
  byName: Map<string, Persona>;
  recipeCache?: Map<string, FusionPair[]>;
}

const pairKey = (a: string, b: string) => (a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`);

export function isAvailable(persona: Persona, enabledDlc: ReadonlySet<DlcPack>): boolean {
  return !persona.dlc || enabledDlc.has(persona.dlc);
}

export function createFusionPool(
  allPersonas: readonly Persona[],
  chart: FusionChart,
  enabledDlc: ReadonlySet<DlcPack>,
): FusionPool {
  const personas = allPersonas.filter((p) => isAvailable(p, enabledDlc));
  const byName = new Map(personas.map((p) => [p.name, p]));
  const results = new Map<Arcana, Persona[]>();
  const specialPairs = new Map<string, Persona>();

  for (const p of personas) {
    if (p.specialRecipe) {
      const [x, y] = p.specialRecipe;
      if (p.specialRecipe.length === 2 && byName.has(x) && byName.has(y)) {
        specialPairs.set(pairKey(x, y), p);
      }
      continue;
    }
    const list = results.get(p.arcana) ?? [];
    list.push(p);
    results.set(p.arcana, list);
  }
  for (const list of results.values()) list.sort((x, y) => x.level - y.level);

  return { personas, chart, results, specialPairs, byName };
}

/** Result arcana of fusing two arcana, or undefined when the pair can't fuse. */
export function fuseArcana(chart: FusionChart, a: Arcana, b: Arcana): Arcana | undefined {
  return a === b ? a : chart[a]?.[b];
}

/** Result of a normal two-persona fusion, or null when the pair yields nothing. */
export function fuse(pool: FusionPool, a: Persona, b: Persona): Persona | null {
  if (a.name === b.name || !pool.byName.has(a.name) || !pool.byName.has(b.name)) return null;

  const special = pool.specialPairs.get(pairKey(a.name, b.name));
  if (special) return special;

  const isIngredient = (p: Persona) => p.name === a.name || p.name === b.name;
  const levelSum = a.level + b.level;

  if (a.arcana === b.arcana) {
    // Highest persona of the same arcana at or below (A + B) / 2 + 1, excluding both ingredients.
    const candidates = (pool.results.get(a.arcana) ?? []).filter(
      (p) => !isIngredient(p) && 2 * p.level <= levelSum + 2,
    );
    return candidates.at(-1) ?? null;
  }

  const arcana = fuseArcana(pool.chart, a.arcana, b.arcana);
  if (!arcana) return null;

  const candidates = (pool.results.get(arcana) ?? []).filter((p) => !isIngredient(p));
  if (candidates.length === 0) return null;
  // Lowest persona at or above (A + B + 1) / 2; past the top of the arcana, the highest.
  return candidates.find((p) => 2 * p.level >= levelSum + 1) ?? candidates[candidates.length - 1];
}

function buildRecipeCache(pool: FusionPool): Map<string, FusionPair[]> {
  const cache = new Map<string, FusionPair[]>();
  const { personas } = pool;
  for (let i = 0; i < personas.length; i++) {
    for (let j = i + 1; j < personas.length; j++) {
      const [a, b] = personas[i].level <= personas[j].level ? [personas[i], personas[j]] : [personas[j], personas[i]];
      const result = fuse(pool, a, b);
      if (!result) continue;
      const list = cache.get(result.name) ?? [];
      list.push({ a, b });
      cache.set(result.name, list);
    }
  }
  for (const list of cache.values()) {
    list.sort((x, y) => Math.max(x.a.level, x.b.level) - Math.max(y.a.level, y.b.level) || x.a.level + x.b.level - (y.a.level + y.b.level));
  }
  return cache;
}

/** Every normal pair that fuses into the target, cheapest (lowest max level) first. */
export function recipesFor(pool: FusionPool, target: Persona): FusionPair[] {
  pool.recipeCache ??= buildRecipeCache(pool);
  return pool.recipeCache.get(target.name) ?? [];
}

/** Every persona the given one can be fused with, and what each fusion makes. */
export function fusionsFrom(pool: FusionPool, persona: Persona): { partner: Persona; result: Persona }[] {
  if (!pool.byName.has(persona.name)) return [];
  return pool.personas.flatMap((partner) => {
    const result = fuse(pool, persona, partner);
    return result ? [{ partner, result }] : [];
  });
}

/** Ingredients of a special recipe that are missing from the pool (e.g. DLC turned off). */
export function missingIngredients(pool: FusionPool, persona: Persona): string[] {
  return (persona.specialRecipe ?? []).filter((name) => !pool.byName.has(name));
}
