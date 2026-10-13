import type { Affinity, Arcana, SkillType, StatKey } from "@/types/game";

export const SKILL_TYPE_LABEL: Record<SkillType, string> = {
  slash: "Slash",
  strike: "Strike",
  pierce: "Pierce",
  fire: "Fire",
  ice: "Ice",
  elec: "Elec",
  wind: "Wind",
  light: "Light",
  dark: "Dark",
  almighty: "Almighty",
  ailment: "Ailment",
  recovery: "Recovery",
  support: "Support",
  special: "Special",
  passive: "Passive",
};

/** In-game abbreviations shown on the affinity row. */
export const AFFINITY_SHORT: Record<Affinity, string> = {
  weak: "Wk",
  normal: "–",
  resist: "Str",
  null: "Nul",
  repel: "Rpl",
  absorb: "Drn",
};

export const AFFINITY_LABEL: Record<Affinity, string> = {
  weak: "Weak",
  normal: "Normal",
  resist: "Resist",
  null: "Null",
  repel: "Repel",
  absorb: "Drain",
};

export const STAT_LABEL: Record<StatKey, string> = {
  st: "St",
  ma: "Ma",
  en: "En",
  ag: "Ag",
  lu: "Lu",
};

/** Tarot numerals; Aeon has none in P3. */
export const ARCANA_NUMERAL: Record<Arcana, string> = {
  Fool: "0",
  Magician: "I",
  Priestess: "II",
  Empress: "III",
  Emperor: "IV",
  Hierophant: "V",
  Lovers: "VI",
  Chariot: "VII",
  Justice: "VIII",
  Hermit: "IX",
  Fortune: "X",
  Strength: "XI",
  "Hanged Man": "XII",
  Death: "XIII",
  Temperance: "XIV",
  Devil: "XV",
  Tower: "XVI",
  Star: "XVII",
  Moon: "XVIII",
  Sun: "XIX",
  Judgement: "XX",
  Aeon: "",
};
