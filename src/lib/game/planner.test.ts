import { describe, expect, it } from "vitest";
import { DLC_PACKS, type Persona } from "@/types/game";
import { FUSION_CHART, PERSONAS, getPersona, getSkill } from "./data";
import { createFusionPool, fuse } from "./fusion";
import { canInherit } from "./inheritance";
import { findFusionPaths, flattenPath, type PlanStep } from "./planner";

const base = createFusionPool(PERSONAS, FUSION_CHART, new Set());
const p = (name: string) => getPersona(name)!;

/** Every fusion in the tree is real, and every skill reaches the result legitimately. */
function expectValidPath(step: PlanStep, pool = base) {
  const { persona, ingredients, skills } = step;
  if (!ingredients) {
    for (const s of skills) expect(persona.skills.some((k) => k.name === s.name), `${persona.name} learns ${s.name}`).toBe(true);
    return;
  }
  if (persona.specialRecipe) {
    expect(ingredients.map((i) => i.persona.name)).toEqual(persona.specialRecipe);
  } else {
    expect(fuse(pool, ingredients[0].persona, ingredients[1].persona)?.name).toBe(persona.name);
  }
  for (const s of skills) {
    if (s.source === "native") {
      expect(persona.skills.some((k) => k.name === s.name)).toBe(true);
    } else {
      expect(canInherit(persona, getSkill(s.name)!), `${persona.name} inherits ${s.name}`).toBe(true);
      expect(ingredients.some((i) => i.skills.some((k) => k.name === s.name)), `${s.name} reaches ${persona.name}`).toBe(true);
    }
  }
  ingredients.forEach((i) => expectValidPath(i, pool));
}

describe("FusionPlanner", () => {
  it("returns the cheapest recipes when no skills are chosen", () => {
    const { paths } = findFusionPaths(base, p("Narcissus"), []);
    expect(paths.length).toBeGreaterThan(1);
    paths.forEach((path) => expectValidPath(path));
  });

  it("takes an inherited skill from an ingredient that learns it", () => {
    const { paths } = findFusionPaths(base, p("Narcissus"), ["Agi"]);
    const [path] = paths;
    expectValidPath(path);
    expect(path.skills).toEqual([{ name: "Agi", source: "inherited" }]);
  });

  it("marks skills the target learns itself as native with their level", () => {
    const { paths } = findFusionPaths(base, p("Thanatos"), ["Megidolaon"]);
    expect(paths[0].skills).toEqual([{ name: "Megidolaon", source: "native", level: 84 }]);
  });

  it("carries skills through several fusions", () => {
    const { paths } = findFusionPaths(base, p("Yurlungur"), ["Apt Pupil", "Poison Arrow", "Mabaisudi"]);
    expect(paths.length).toBeGreaterThan(0);
    expectValidPath(paths[0]);
    expect(flattenPath(paths[0]).fusions.length).toBeGreaterThan(1);
  });

  it("splits carried skills across both ingredients when needed", () => {
    const { paths } = findFusionPaths(base, p("Samael"), ["Survive Dark", "Survival Trick", "Foul Breath"]);
    paths.forEach((path) => expectValidPath(path));
  });

  it("uses every ingredient of a special fusion", () => {
    const { paths } = findFusionPaths(base, p("Alice"), []);
    expect(paths).toHaveLength(1);
    expect(paths[0].special).toBe(true);
    expect(paths[0].ingredients?.map((i) => i.persona.name)).toEqual(["Pixie", "Lilim", "Narcissus", "Titania"]);
  });

  it("carries skills into a six-persona special fusion through single carriers", () => {
    const { paths } = findFusionPaths(base, p("Thanatos"), ["Agi", "Agilao", "Ali Dance"]);
    paths.forEach((path) => expectValidPath(path));
    for (const path of paths) {
      const carriers = path.ingredients?.filter((i) => i.ingredients) ?? [];
      expect(carriers.length).toBeLessThanOrEqual(1);
    }
  });

  it("rejects a skill the target's element can't inherit", () => {
    expect(findFusionPaths(base, p("Jack Frost"), ["Agi"]).failure).toEqual({
      kind: "blocked",
      skill: "Agi",
      reason: "element",
    });
  });

  it("rejects persona-exclusive skills and unknown skills", () => {
    expect(findFusionPaths(base, p("Pixie"), ["Die For Me!"]).failure).toMatchObject({ reason: "exclusive" });
    expect(findFusionPaths(base, p("Pixie"), ["Not A Skill"]).failure).toMatchObject({ reason: "exclusive" });
  });

  it("rejects more than eight skills", () => {
    const skills = ["Agi", "Bufu", "Zio", "Garu", "Dia", "Media", "Tarukaja", "Rakukaja", "Sukukaja"];
    expect(findFusionPaths(base, p("Pixie"), skills).failure).toEqual({ kind: "too-many-skills", count: 9 });
  });

  it("rejects more than six inherited skills", () => {
    const skills = ["Agilao", "Garula", "Zionga", "Bufula", "Hama", "Mudo", "Dia"];
    expect(findFusionPaths(base, p("Kikuri-Hime"), skills).failure).toMatchObject({ kind: "too-many-inherited", count: 7 });
  });

  it("reports special fusions whose DLC ingredients are off", () => {
    const needsDlc: Persona = { ...p("Alice"), name: "Test", specialRecipe: ["Izanagi", "Pixie"] };
    expect(findFusionPaths(base, needsDlc, []).failure).toEqual({ kind: "no-recipe" });
  });

  it("reports when no path fits the search limits", () => {
    expect(findFusionPaths(base, p("Narcissus"), ["Agi"], { budget: 0 }).failure).toEqual({ kind: "not-found" });
  });

  it("finds paths through DLC personas when their packs are on", () => {
    const dlc = createFusionPool(PERSONAS, FUSION_CHART, new Set(DLC_PACKS));
    const { paths } = findFusionPaths(dlc, p("Arsène"), []);
    expect(paths[0].ingredients?.map((i) => i.persona.name)).toEqual(p("Arsène").specialRecipe);
    paths.forEach((path) => expectValidPath(path, dlc));
  });

  it("flattens a path into personas to obtain and fusions in order", () => {
    const { paths } = findFusionPaths(base, p("Yurlungur"), ["Apt Pupil", "Poison Arrow", "Mabaisudi"]);
    const { obtain, fusions } = flattenPath(paths[0]);
    expect(fusions.at(-1)?.persona.name).toBe("Yurlungur");
    expect(obtain.every((o) => !o.ingredients)).toBe(true);
    const made = new Set<string>();
    for (const f of fusions) {
      for (const i of f.ingredients ?? []) {
        if (i.ingredients) expect(made.has(i.persona.name)).toBe(true);
      }
      made.add(f.persona.name);
    }
  });
});
