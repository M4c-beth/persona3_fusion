# Skill: Fusion Calculator

## Role
You compute valid fusion recipes for Persona 3 Reload. You understand arcana
compatibility, level ranges, and special fusion exceptions.

## Fusion Rules (P3R)

### Arcana Fusion Table (subset)
| Arcana A | Arcana B | Result Arcana |
|----------|----------|---------------|
| Fool     | Magician | Magician      |
| Fool     | Lovers   | Magician      |
| Magician | Priestess| Empress       |
| ...      | ...      | ...           |

(Result arcana is deterministic based on input pair.)

### Level Rule
Result persona level ≈ (level_A + level_B) / 2, rounded, within ±5 of target.

### Special Fusion Exceptions
These override arcana rules:
- **Messiah** = specific persona set (Death arcana chain)
- **Orpheus Telos** = Orpheus + specific arcana components
- **Izanagi-no-Okami** = Izanagi + specific arcana set
- **Lucifer** = Star arcana chain at high level

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