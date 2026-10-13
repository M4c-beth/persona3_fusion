import type { Persona, Skill } from "@/types/game";

/** Most skills a persona can hold. */
export const MAX_SKILLS = 8;

export type InheritBlock = "exclusive" | "element";

/** Why `persona` can't inherit `skill`, or null when it can. */
export function inheritBlock(persona: Persona, skill: Skill): InheritBlock | null {
  if (!skill.inheritable) return "exclusive";
  if (persona.cannotInherit?.includes(skill.type)) return "element";
  return null;
}

export function canInherit(persona: Persona, skill: Skill): boolean {
  return inheritBlock(persona, skill) === null;
}

/**
 * How many skills a fusion can pass on, from the ingredients' combined skill count.
 * Uses the Persona 3 table (3–5 → 1, 6–8 → 2, 9–11 → 3, 12–23 → 4, 24–31 → 5, 32+ → 6);
 * Reload has not published its own, and guides report the same 12+ → 4 threshold.
 */
export function inheritLimit(totalIngredientSkills: number): number {
  if (totalIngredientSkills >= 32) return 6;
  if (totalIngredientSkills >= 24) return 5;
  if (totalIngredientSkills >= 12) return 4;
  if (totalIngredientSkills >= 9) return 3;
  if (totalIngredientSkills >= 6) return 2;
  return 1;
}
