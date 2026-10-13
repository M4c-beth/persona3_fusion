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

### Level Rule
Result persona level ≈ (level_A + level_B) / 2, rounded, within ±5 of target.

### Special Fusion Exceptions
These override arcana rules. Recipes below must be verified against P3R data before use:
- **Messiah** (Judgement) = Orpheus + Thanatos
- **Orpheus Telos** — multi-persona special fusion — `unverified`, confirm recipe
- **Izanagi-no-Okami** — `unverified`, confirm availability and recipe in P3R
- **Lucifer** — `unverified`, confirm arcana and recipe in P3R

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
