import personasJson from "@/data/personas.json";
import skillsJson from "@/data/skills.json";
import chartJson from "@/data/fusion-chart.json";
import sourceJson from "@/data/source.json";
import type { FusionChart, Persona, Skill } from "@/types/game";

// Validated by scripts/import-data.ts and src/lib/game/data.test.ts.
export const PERSONAS = personasJson as Persona[];
export const SKILLS = skillsJson as Skill[];
export const FUSION_CHART = chartJson as FusionChart;
export const DATA_SOURCE = sourceJson;

const personaByName = new Map(PERSONAS.map((p) => [p.name, p]));
const personaBySlug = new Map(PERSONAS.map((p) => [p.slug, p]));
const skillByName = new Map(SKILLS.map((s) => [s.name, s]));
const skillBySlug = new Map(SKILLS.map((s) => [s.slug, s]));

export const getPersona = (name: string) => personaByName.get(name);
export const getPersonaBySlug = (slug: string) => personaBySlug.get(slug);
export const getSkill = (name: string) => skillByName.get(name);
export const getSkillBySlug = (slug: string) => skillBySlug.get(slug);

/** Personas that learn the given skill, with the level they learn it at. */
export function learnedBy(skillName: string): { persona: Persona; level: number; fusionSpell: boolean }[] {
  return PERSONAS.flatMap((persona) =>
    persona.skills
      .filter((s) => s.name === skillName)
      .map((s) => ({ persona, level: s.level, fusionSpell: !!s.fusionSpell })),
  );
}
