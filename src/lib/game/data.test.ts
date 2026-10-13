import { describe, expect, it } from "vitest";
import { ARCANA } from "@/types/game";
import { FUSION_CHART, PERSONAS, SKILLS, getPersona, getPersonaBySlug, getSkill, getSkillBySlug, learnedBy } from "./data";
import { fusionChartSchema, personasSchema, skillsSchema } from "./schema";

describe("game data", () => {
  it("matches the persona schema", () => {
    expect(() => personasSchema.parse(PERSONAS)).not.toThrow();
  });

  it("matches the skill schema", () => {
    expect(() => skillsSchema.parse(SKILLS)).not.toThrow();
  });

  it("matches the fusion chart schema", () => {
    expect(() => fusionChartSchema.parse(FUSION_CHART)).not.toThrow();
  });

  it("has unique persona names and slugs (case-insensitive)", () => {
    const names = new Set(PERSONAS.map((p) => p.name.toLowerCase()));
    const slugs = new Set(PERSONAS.map((p) => p.slug));
    expect(names.size).toBe(PERSONAS.length);
    expect(slugs.size).toBe(PERSONAS.length);
  });

  it("links every persona skill to an existing skill", () => {
    for (const p of PERSONAS) {
      for (const s of p.skills) expect(getSkill(s.name), `${p.name} → ${s.name}`).toBeDefined();
    }
  });

  it("links every special recipe ingredient to an existing persona", () => {
    for (const p of PERSONAS) {
      for (const name of p.specialRecipe ?? []) expect(getPersona(name), `${p.name} ← ${name}`).toBeDefined();
    }
  });

  it("has a symmetric arcana chart", () => {
    for (const a of ARCANA) {
      for (const b of ARCANA) expect(FUSION_CHART[a]?.[b], `${a} × ${b}`).toBe(FUSION_CHART[b]?.[a]);
    }
  });

  it("has no result for Death × Aeon", () => {
    expect(FUSION_CHART.Death?.Aeon).toBeUndefined();
  });

  it("keeps canon names with diacritics and hyphens", () => {
    expect(getPersonaBySlug("arsene")?.name).toBe("Arsène");
    expect(getPersona("Magatsu-Izanagi")?.dlc).toBe("P4G Persona Set");
  });

  it("makes Messiah from Orpheus and Thanatos", () => {
    expect(getPersona("Messiah")?.specialRecipe).toEqual(["Orpheus", "Thanatos"]);
  });

  it("finds skills by slug", () => {
    expect(getSkillBySlug("enduring-soul")?.name).toBe("Enduring Soul");
  });

  it("lists who learns a skill", () => {
    const users = learnedBy("Cadenza").map((u) => u.persona.name);
    expect(users).toEqual(expect.arrayContaining(["Orpheus", "Apsaras"]));
    expect(learnedBy("Cadenza").every((u) => u.fusionSpell)).toBe(true);
  });
});
