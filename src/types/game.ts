export const ARCANA = [
  "Fool",
  "Magician",
  "Priestess",
  "Empress",
  "Emperor",
  "Hierophant",
  "Lovers",
  "Chariot",
  "Justice",
  "Hermit",
  "Fortune",
  "Strength",
  "Hanged Man",
  "Death",
  "Temperance",
  "Devil",
  "Tower",
  "Star",
  "Moon",
  "Sun",
  "Judgement",
  "Aeon",
] as const;

export type Arcana = (typeof ARCANA)[number];

export const ELEMENTS = [
  "slash",
  "strike",
  "pierce",
  "fire",
  "ice",
  "elec",
  "wind",
  "light",
  "dark",
] as const;

export type Element = (typeof ELEMENTS)[number];

export const SKILL_TYPES = [
  ...ELEMENTS,
  "almighty",
  "ailment",
  "recovery",
  "support",
  "special",
  "passive",
] as const;

export type SkillType = (typeof SKILL_TYPES)[number];

export const AFFINITIES = ["weak", "normal", "resist", "null", "repel", "absorb"] as const;

export type Affinity = (typeof AFFINITIES)[number];

export const DLC_PACKS = ["P5R Persona Set 1", "P5R Persona Set 2", "P4G Persona Set"] as const;

export type DlcPack = (typeof DLC_PACKS)[number];

export const STAT_KEYS = ["st", "ma", "en", "ag", "lu"] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export interface PersonaSkill {
  name: string;
  /** Level the skill is learned at; 0 = innate. */
  level: number;
  /** Theurgy fusion spell — needs the partner persona in stock, not learned by level. */
  fusionSpell?: true;
}

export interface Persona {
  name: string;
  slug: string;
  arcana: Arcana;
  level: number;
  stats: Record<StatKey, number>;
  affinities: Record<Element, Affinity>;
  skills: PersonaSkill[];
  heartItem?: { name: string; level: number };
  /** How the persona becomes available for fusion (social link, request, ...). */
  unlock?: string;
  dlc?: DlcPack;
  /** Ingredients when the persona can only be made by special fusion. */
  specialRecipe?: string[];
}

export interface Skill {
  name: string;
  slug: string;
  type: SkillType;
  target: string;
  /** Display cost, e.g. "12 SP" or "8% HP"; empty for passives. */
  cost: string;
  power: number;
  effect: string;
  /** Sort rank within its type; higher is stronger. */
  rank: number;
  unique: boolean;
}

/** Arcana fusion chart: chart[a][b] = result arcana, symmetric. */
export type FusionChart = Partial<Record<Arcana, Partial<Record<Arcana, Arcana>>>>;
