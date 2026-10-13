import { z } from "zod";
import { AFFINITIES, ARCANA, DLC_PACKS, ELEMENTS, SKILL_TYPES } from "@/types/game";

const name = z.string().min(1).max(40);

export const arcanaSchema = z.enum(ARCANA);
const affinity = z.enum(AFFINITIES);

export const personaSchema = z.object({
  name,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  arcana: arcanaSchema,
  level: z.number().int().min(1).max(99),
  stats: z.object({
    st: z.number().int().min(1).max(99),
    ma: z.number().int().min(1).max(99),
    en: z.number().int().min(1).max(99),
    ag: z.number().int().min(1).max(99),
    lu: z.number().int().min(1).max(99),
  }),
  affinities: z.record(z.enum(ELEMENTS), affinity).refine(
    (a) => ELEMENTS.every((e) => e in a),
    "every element needs an affinity",
  ),
  skills: z
    .array(
      z.object({
        name,
        level: z.number().int().min(0).max(99),
        fusionSpell: z.literal(true).optional(),
      }),
    )
    .min(1),
  heartItem: z.object({ name: z.string().min(1), level: z.number().int().min(1).max(99) }).optional(),
  unlock: z.string().min(1).optional(),
  dlc: z.enum(DLC_PACKS).optional(),
  specialRecipe: z.array(name).min(2).optional(),
});

export const skillSchema = z.object({
  name,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(SKILL_TYPES),
  target: z.string(),
  cost: z.string(),
  power: z.number().int().min(0),
  effect: z.string(),
  rank: z.number().int().min(0),
  unique: z.boolean(),
});

export const fusionChartSchema = z.record(arcanaSchema, z.record(arcanaSchema, arcanaSchema));

export const personasSchema = z.array(personaSchema);
export const skillsSchema = z.array(skillSchema);
