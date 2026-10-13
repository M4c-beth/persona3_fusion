import { describe, expect, it } from "vitest";
import { DLC_PACKS, type Arcana, type FusionChart, type Persona } from "@/types/game";
import { FUSION_CHART, PERSONAS, getPersona } from "./data";
import {
  createFusionPool,
  fuse,
  fuseArcana,
  fusionsFrom,
  isAvailable,
  missingIngredients,
  recipesFor,
} from "./fusion";

const base = createFusionPool(PERSONAS, FUSION_CHART, new Set());
const allDlc = createFusionPool(PERSONAS, FUSION_CHART, new Set(DLC_PACKS));
const p = (name: string) => {
  const persona = getPersona(name);
  if (!persona) throw new Error(`No persona ${name}`);
  return persona;
};

function stub(name: string, arcana: Arcana, level: number, extra: Partial<Persona> = {}): Persona {
  return {
    name,
    slug: name.toLowerCase(),
    arcana,
    level,
    stats: { st: 1, ma: 1, en: 1, ag: 1, lu: 1 },
    affinities: {
      slash: "normal", strike: "normal", pierce: "normal", fire: "normal", ice: "normal",
      elec: "normal", wind: "normal", light: "normal", dark: "normal",
    },
    skills: [{ name: "Agi", level: 0 }],
    ...extra,
  };
}

describe("FusionCalculator", () => {
  describe("fuseArcana", () => {
    it("returns the same arcana for a same-arcana pair", () => {
      expect(fuseArcana(FUSION_CHART, "Fool", "Fool")).toBe("Fool");
    });

    it("reads the chart for different arcana", () => {
      expect(fuseArcana(FUSION_CHART, "Fool", "Lovers")).toBe("Justice");
    });

    it("rejects invalid arcana pair", () => {
      expect(fuseArcana(FUSION_CHART, "Death", "Aeon")).toBeUndefined();
    });
  });

  describe("fuse", () => {
    it("picks the lowest result at or above the average level", () => {
      expect(fuse(base, p("Orpheus"), p("Pixie"))?.name).toBe("Angel");
      expect(fuse(base, p("Orpheus"), p("Power"))?.name).toBe("Narcissus");
    });

    it("falls back to the highest persona of the arcana when the average is above all", () => {
      expect(fuse(base, p("Futsunushi"), p("Odin"))?.name).toBe("Cybele");
    });

    it("fuses down within the same arcana, skipping both ingredients", () => {
      expect(fuse(base, p("Jack Frost"), p("Jack-o'-Lantern"))?.name).toBe("Nekomata");
    });

    it("returns null when no same-arcana persona is low enough", () => {
      expect(fuse(base, p("Nekomata"), p("Jack Frost"))).toBeNull();
    });

    it("returns null for an arcana pair with no result", () => {
      expect(fuse(base, p("Mot"), p("Uriel"))).toBeNull();
    });

    it("returns null when fusing a persona with itself", () => {
      expect(fuse(base, p("Pixie"), p("Pixie"))).toBeNull();
    });

    it("applies two-persona special recipes", () => {
      expect(fuse(base, p("Orpheus"), p("Thanatos"))?.name).toBe("Messiah");
      expect(fuse(base, p("Barong"), p("Rangda"))?.name).toBe("Shiva");
    });

    it("never yields special-recipe personas from normal fusion", () => {
      for (const list of base.results.values()) {
        for (const result of list) expect(result.specialRecipe).toBeUndefined();
      }
    });

    it("returns null when the result arcana has no normal-fusion personas", () => {
      const chart: FusionChart = { Fool: { Magician: "Star" }, Magician: { Fool: "Star" } };
      const a = stub("A", "Fool", 10);
      const b = stub("B", "Magician", 10);
      const s = stub("S", "Star", 10, { specialRecipe: ["A", "B", "C"] });
      const c = stub("C", "Star", 12, { specialRecipe: ["A", "B", "S"] });
      const pool = createFusionPool([a, b, s, c], chart, new Set());
      expect(fuse(pool, a, b)).toBeNull();
      expect(fuse(pool, s, c)).toBeNull();
    });

    it("ignores a two-persona special whose ingredient is unavailable", () => {
      const a = stub("A", "Fool", 10);
      const b = stub("B", "Fool", 20);
      const special = stub("S", "Fool", 30, { specialRecipe: ["A", "Missing"] });
      const pool = createFusionPool([a, b, special], FUSION_CHART, new Set());
      expect(pool.specialPairs.size).toBe(0);
    });

    it("includes DLC personas as results only when their pack is on", () => {
      expect(fuse(allDlc, p("Orpheus"), p("Power"))?.name).toBe("Carmen");
    });

    it("rejects DLC ingredients when their pack is off", () => {
      expect(fuse(base, p("Izanagi"), p("Pixie"))).toBeNull();
    });

    it("skips an ingredient that would be its own result", () => {
      const chart: FusionChart = { Fool: { Magician: "Magician" }, Magician: { Fool: "Magician" } };
      const fool = stub("F", "Fool", 10);
      const mag = stub("M", "Magician", 10);
      const higher = stub("M2", "Magician", 20);
      expect(fuse(createFusionPool([fool, mag, higher], chart, new Set()), fool, mag)?.name).toBe("M2");
      expect(fuse(createFusionPool([fool, mag], chart, new Set()), fool, mag)).toBeNull();
    });
  });

  describe("recipesFor", () => {
    it("returns only pairs that fuse into Angel", () => {
      const recipes = recipesFor(base, p("Angel"));
      expect(recipes.length).toBeGreaterThan(0);
      for (const { a, b } of recipes) expect(fuse(base, a, b)?.name).toBe("Angel");
    });

    it("sorts cheapest recipes first and orders each pair by level", () => {
      const recipes = recipesFor(base, p("Narcissus"));
      const maxLevels = recipes.map((r) => Math.max(r.a.level, r.b.level));
      expect(maxLevels).toEqual([...maxLevels].sort((x, y) => x - y));
      for (const { a, b } of recipes) expect(a.level).toBeLessThanOrEqual(b.level);
    });

    it("returns no normal recipes for Thanatos (special fusion only)", () => {
      expect(recipesFor(base, p("Thanatos"))).toEqual([]);
    });

    it("changes recipes when DLC is on", () => {
      const names = (pool: typeof base) => recipesFor(pool, p("Narcissus")).map((r) => `${r.a.name}+${r.b.name}`);
      expect(names(allDlc)).not.toEqual(names(base));
    });
  });

  describe("fusionsFrom", () => {
    it("lists partners and results that agree with fuse", () => {
      const list = fusionsFrom(base, p("Pixie"));
      expect(list.length).toBeGreaterThan(0);
      for (const { partner, result } of list) expect(fuse(base, p("Pixie"), partner)?.name).toBe(result.name);
    });

    it("returns nothing for a persona outside the pool", () => {
      expect(fusionsFrom(base, p("Izanagi"))).toEqual([]);
    });
  });

  describe("DLC availability", () => {
    it("treats base-game personas as always available", () => {
      expect(isAvailable(p("Pixie"), new Set())).toBe(true);
    });

    it("gates DLC personas by pack", () => {
      expect(isAvailable(p("Izanagi"), new Set())).toBe(false);
      expect(isAvailable(p("Izanagi"), new Set(["P4G Persona Set"]))).toBe(true);
      expect(isAvailable(p("Izanagi"), new Set(["P5R Persona Set 1"]))).toBe(false);
    });

    it("reports special-recipe ingredients that are unavailable", () => {
      expect(missingIngredients(base, p("Pixie"))).toEqual([]);
      expect(missingIngredients(base, p("Messiah"))).toEqual([]);
      const needsDlc = stub("X", "Fool", 50, { specialRecipe: ["Izanagi", "Pixie", "Angel"] });
      expect(missingIngredients(base, needsDlc)).toEqual(["Izanagi"]);
    });
  });
});
