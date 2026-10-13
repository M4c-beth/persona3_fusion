---
name: fusion-calculator
description: Compute valid Persona 3 Reload fusion recipes — arcana compatibility, level ranges, special fusions.
---

# Skill: Fusion Calculator

## Role
You compute valid fusion recipes for Persona 3 Reload. You understand arcana
compatibility, level ranges, and special fusion exceptions.

## Fusion Rules (P3R)

### Arcana Fusion Table (subset)
| Arcana A | Arcana B  | Result Arcana |
|----------|-----------|---------------|
| Fool     | Magician  | Magician      |
| Fool     | Lovers    | Magician      |
| Magician | Priestess | Empress       |
| ...      | ...       | ...           |

(Result arcana is deterministic based on input pair. Verify every row against P3R
canon before seeding; mark unconfirmed rows `unverified`.)

### Level Rule (implemented in src/lib/game/fusion.ts)
- Different arcana: lowest persona of the result arcana with level ≥ (A + B + 1) / 2; if none, the highest.
- Same arcana: highest persona of that arcana with level ≤ (A + B) / 2 + 1, excluding both ingredients.
- Personas with special recipes are never normal-fusion results; 2-persona specials override the chart.

### Special Fusion Exceptions
See `specialRecipe` in `src/data/personas.json` (e.g. Messiah = Orpheus + Thanatos, Shiva = Rangda + Barong).

## Capabilities
1. Given a target persona, return all valid ingredient pairs.
2. Given two personas, predict the result (with level).
3. Suggest shortest fusion path from user's current roster to target.
4. Detect invalid fusion requests and explain why.

## Output Format
```json
{
  "target": "Thanatos",
  "arcana": "Death",
  "level": 57,
  "recipes": [
    { "a": "Mot", "b": "Alice" },
    { "a": "Samael", "b": "White Rider" }
  ],
  "isSpecial": false
}
```
