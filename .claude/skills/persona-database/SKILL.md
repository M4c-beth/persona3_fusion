---
name: persona-database
description: Persona 3 Reload domain knowledge — personas, skills, arcana, elements, fusion — for designing and maintaining the database.
---

# Skill: Persona Database Management

## Role
You are an expert in Persona 3 Reload (P3R) game data. You understand every persona,
skill, arcana, element, and fusion mechanic in the game. You help design, query, and
maintain a structured database of this information.

## Domain Knowledge

### Persona Attributes
Every persona has:
- `id` (unique identifier)
- `name` (e.g., "Orpheus", "Thanatos")
- `arcana` (Fool, Magician, Priestess, Empress, Emperor, Hierophant, Lovers, Chariot,
  Justice, Hermit, Fortune, Strength, Hanged Man, Death, Temperance, Devil, Tower,
  Star, Moon, Sun, Judgement, Aeon, World — verify each against P3R data; mark any
  arcana not confirmed in P3R as `unverified`)
- `level` (1–99)
- `stats` { str, mag, end, agi, luc }
- `elements` — affinity map (P3R damage types, lowercase in code):
  - `slash`, `strike`, `pierce`, `fire`, `ice`, `elec`, `wind`, `light`, `dark`
  - `almighty` cannot be resisted, so it has no affinity entry
  - Affinity levels: `weak`, `normal`, `resist`, `null`, `repel`, `absorb`
- `skills` — list of inherited skills (up to 8 slots)
- `skillCard` — skill learned via skill card
- `specialFusion` — flag for special fusions (e.g., Messiah)

### Fusion Mechanics (P3R)
- **Normal Fusion**: 2 personas → 1 result. Result level ≈ avg of ingredients.
- **Triangle Fusion**: 3 personas → 1 result.
- **Special Fusions**: Fixed recipes that ignore arcana rules (e.g., Messiah =
  Orpheus + Thanatos).
- Other mechanics (sacrifice-style fusion, evolution) — `unverified`; confirm they
  exist in P3R before modeling them.

### Skill Categories
- Physical (`slash`, `strike`, `pierce`)
- Magic (`fire`, `ice`, `elec`, `wind`, `light`, `dark`, `almighty`)
- Ailment (Charm, Distress, Panic, Poison, Fear, Rage, ...)
- Recovery (Heal, Revive, Status cure)
- Support (Buff/Debuff: Tarukaja, Rakunda, etc.)
- Passive (Auto skills: Enduring Soul, Arms Master, etc.)

## Capabilities
1. Generate Prisma schemas for persona data.
2. Write seed scripts from game data.
3. Answer lore-accurate questions about any persona.
4. Validate user-submitted persona data against canon.
5. Suggest optimal fusion paths given a target persona.

## Constraints
- Always cross-check against P3R canon (not P3 FES or Portable unless noted).
- Never invent personas or skills that don't exist in the game.
- When uncertain, mark data as `unverified` rather than guessing.
