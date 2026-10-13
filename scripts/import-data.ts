/**
 * Imports Persona 3 Reload data from aqiu384/megaten-fusion-tool (Unlicense)
 * at a pinned commit, converts it to this project's schema, validates it with
 * zod and writes it to src/data/.
 *
 * Usage: npm run import-data
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { fusionChartSchema, personasSchema, skillsSchema } from "../src/lib/game/schema";
import { slugify } from "../src/lib/slugify";
import {
  ARCANA,
  ELEMENTS,
  type Affinity,
  type Arcana,
  type DlcPack,
  type FusionChart,
  type Persona,
  type Skill,
  type SkillType,
} from "../src/types/game";

const SOURCE_REPO = "aqiu384/megaten-fusion-tool";
const SOURCE_SHA = "0b207612f6cdcff092e62af16f5c355271a1d892";
const RAW = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_SHA}/src/app`;
const OUT_DIR = path.resolve(__dirname, "../src/data");

/** Source names that differ from the official English localization. */
const DISPLAY_NAMES: Record<string, string> = {
  Arsene: "Arsène",
  "Seiten Taisei A": "Seiten Taisei",
  "Loki A": "Loki (P5R)", // base game also has a Fool-arcana Loki
};

const ARCANA_NAMES: Record<string, Arcana> = { Hanged: "Hanged Man" };

const DLC_NAMES: Record<string, DlcPack> = {
  "Persona 5 Set 1": "P5R Persona Set 1",
  "Persona 5 Set 2": "P5R Persona Set 2",
  "Persona 4 Set": "P4G Persona Set",
  "Persona 4 Set 1": "P4G Persona Set",
};

const RESIST_CODES: Record<string, Affinity> = {
  "-": "normal",
  w: "weak",
  s: "resist",
  n: "null",
  r: "repel",
  d: "absorb",
};

/** Order of the bits in comp-config inheritTypes (1 = can inherit). */
const INHERIT_ELEMS: SkillType[] = [
  "slash", "strike", "pierce", "fire", "ice", "elec", "wind", "light", "dark", "ailment", "recovery", "support",
];

const SKILL_TYPE_CODES: Record<string, SkillType> = {
  sla: "slash",
  str: "strike",
  pie: "pierce",
  fir: "fire",
  ice: "ice",
  ele: "elec",
  win: "wind",
  lig: "light",
  dar: "dark",
  alm: "almighty",
  ail: "ailment",
  rec: "recovery",
  sup: "support",
  spe: "special",
  pas: "passive",
};

const sourcePersona = z.object({
  race: z.string(),
  lvl: z.number(),
  resists: z.string().length(10),
  skills: z.record(z.number()),
  stats: z.array(z.number()).length(5),
  heart: z.string().optional(),
  heartlvl: z.number().optional(),
  inherits: z.string(),
});

const sourceSkill = z.object({
  a: z.tuple([z.string(), z.string(), z.string()]),
  b: z.array(z.number()).length(8),
  c: z.tuple([z.string(), z.string(), z.string()]),
});

const sourceUnlocks = z.array(
  z.object({ category: z.string(), conditions: z.record(z.string()) }),
);

async function fetchJson<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${RAW}/${file}`);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  return schema.parse(await res.json());
}

const displayName = (name: string) => DISPLAY_NAMES[name] ?? name;
const toArcana = (race: string): Arcana => {
  const arcana = ARCANA_NAMES[race] ?? race;
  if (!(ARCANA as readonly string[]).includes(arcana)) throw new Error(`Unknown arcana ${race}`);
  return arcana as Arcana;
};

function describeUnlock(condition: string): string {
  const floor = condition.match(/^(\w+ [IV]+) (\d+)$/);
  if (floor) return `Reach Tartarus floor ${floor[2]} (${floor[1]})`;
  const link = condition.match(/^(\w+) Rank 10$/);
  if (link) return `Max the ${toArcana(link[1])} Social Link`;
  const teammate = condition.match(/^(\w+) Max Link$/);
  if (teammate) return `Max ${teammate[1]}'s Link`;
  return condition;
}

/** Port of megaten-fusion-tool's skillRowToEffect, minus the power text. */
function describeSkillEffect(nums: number[], descs: string[], effects: Record<string, string>): string {
  const [, , , minHits, maxHits, acc, crit, mod] = nums;
  const [effect, cond] = descs;
  const condStr = cond.startsWith("FMT") ? effects[cond.substring(3)] ?? "" : cond;
  const modStr = `${mod < 1000 ? mod : (mod - 1000) / 100}`;
  const parts = [
    minHits !== maxHits ? `${minHits}-${maxHits} hits` : maxHits < 2 ? "" : `${maxHits} hits`,
    acc === 0 || (90 <= acc && acc <= 110) ? "" : `${acc}% acc`,
    crit <= 5 ? "" : `${crit}% crit`,
    cond === "-" ? "" : condStr.replace("$1", modStr).replace("$2", effect),
  ].filter(Boolean);
  const text = parts.join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function describeCost(cost: number): string {
  if (cost === 0) return "";
  if (cost < 1000) return `${cost}% HP`;
  if (cost < 2000) return `${cost - 1000} SP`;
  return "Theurgy";
}

async function main() {
  const [demons, skillRows, chartJson, specials, unlocks, effects, compConfig] = await Promise.all([
    fetchJson("p3r/data/demon-data.json", z.record(sourcePersona)),
    fetchJson("p3r/data/skill-data.json", z.record(sourceSkill)),
    fetchJson(
      "p3r/data/fusion-chart.json",
      z.object({ races: z.array(z.string()), table: z.array(z.array(z.string())) }),
    ),
    fetchJson("p3r/data/special-recipes.json", z.record(z.array(z.string()))),
    fetchJson("p3r/data/demon-unlocks.json", sourceUnlocks),
    fetchJson("compendium/data/skill-effects.json", z.record(z.string())),
    fetchJson("p3r/data/comp-config.json", z.object({ inheritTypes: z.record(z.string().length(12)) })),
  ]);

  const blockedTypes = (inheritType: string): SkillType[] => {
    const bits = compConfig.inheritTypes[inheritType];
    if (!bits) throw new Error(`Unknown inherit type ${inheritType}`);
    return INHERIT_ELEMS.filter((_, i) => bits[i] === "0");
  };

  const unlockFor: Record<string, string> = {};
  const dlcFor: Record<string, DlcPack> = {};
  for (const { category, conditions } of unlocks) {
    for (const [names, condition] of Object.entries(conditions)) {
      for (const name of names.split(",")) {
        if (category === "Downloadable Content") {
          const pack = DLC_NAMES[condition];
          if (!pack) throw new Error(`Unknown DLC pack ${condition}`);
          dlcFor[name] = pack;
        } else {
          unlockFor[name] = describeUnlock(condition);
        }
      }
    }
  }

  const personas: Persona[] = Object.entries(demons)
    .map(([sourceName, d]) => {
      const name = displayName(sourceName);
      const [st, ma, en, ag, lu] = d.stats;
      const persona: Persona = {
        name,
        slug: slugify(name),
        arcana: toArcana(d.race),
        level: d.lvl,
        stats: { st, ma, en, ag, lu },
        affinities: Object.fromEntries(
          ELEMENTS.map((el, i) => {
            const affinity = RESIST_CODES[d.resists[i]];
            if (!affinity) throw new Error(`${sourceName}: unknown resist code ${d.resists[i]}`);
            return [el, affinity];
          }),
        ) as Persona["affinities"],
        skills: Object.entries(d.skills)
          .map(([skill, lvl]) =>
            lvl > 99 ? { name: skill, level: 0, fusionSpell: true as const } : { name: skill, level: lvl < 1 ? 0 : lvl },
          )
          .sort((a, b) => Number(!!a.fusionSpell) - Number(!!b.fusionSpell) || a.level - b.level),
      };
      const blocked = blockedTypes(d.inherits);
      if (blocked.length) persona.cannotInherit = blocked;
      if (d.heart && d.heartlvl) persona.heartItem = { name: d.heart, level: d.heartlvl };
      if (unlockFor[sourceName]) persona.unlock = unlockFor[sourceName];
      if (dlcFor[sourceName]) persona.dlc = dlcFor[sourceName];
      if (specials[sourceName]?.length) persona.specialRecipe = specials[sourceName].map(displayName);
      return persona;
    })
    .sort((a, b) => ARCANA.indexOf(a.arcana) - ARCANA.indexOf(b.arcana) || a.level - b.level);

  const usedSkills = new Set(personas.flatMap((p) => p.skills.map((s) => s.name)));
  const skills: Skill[] = Object.values(skillRows)
    .filter((row) => usedSkills.has(row.a[0]))
    .map(({ a: [name, elem, target], b, c }) => {
      const type = SKILL_TYPE_CODES[elem];
      if (!type) throw new Error(`${name}: unknown skill type ${elem}`);
      return {
        name,
        slug: slugify(name),
        type,
        target: target === "-" ? "Self" : target,
        cost: describeCost(b[1]),
        power: b[2],
        effect: describeSkillEffect(b, c, effects),
        rank: b[0],
        // Rank 0 marks persona-exclusive skills (Die For Me!, Theurgy, ...), which can't be inherited.
        inheritable: b[0] > 0 && b[0] <= 89,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const chart: FusionChart = {};
  const races = chartJson.races.map(toArcana);
  chartJson.table.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === "-") return;
      const [a, b, r] = [races[i], races[j], toArcana(cell)];
      (chart[a] ??= {})[b] = r;
      (chart[b] ??= {})[a] = r;
    });
  });

  const personaNames = new Set(personas.map((p) => p.name));
  for (const p of personas) {
    for (const ingredient of p.specialRecipe ?? []) {
      if (!personaNames.has(ingredient)) throw new Error(`${p.name}: unknown ingredient ${ingredient}`);
    }
  }

  const out = {
    "personas.json": personasSchema.parse(personas),
    "skills.json": skillsSchema.parse(skills),
    "fusion-chart.json": fusionChartSchema.parse(chart),
    "source.json": { repo: SOURCE_REPO, sha: SOURCE_SHA, importedAt: new Date().toISOString().slice(0, 10) },
  };
  for (const [file, data] of Object.entries(out)) {
    writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data, null, 2) + "\n");
  }
  console.log(`Imported ${personas.length} personas, ${skills.length} skills.`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
