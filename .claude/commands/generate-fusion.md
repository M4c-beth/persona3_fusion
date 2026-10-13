# Command: /generate-fusion

## Purpose
Compute all valid fusion recipes for a target persona.

## Usage
Generate-fusion --target "Thanatos"


## Steps
1. Look up target persona.
2. Query fusion recipe table for all matching recipes.
3. For each recipe, verify ingredient personas exist.
4. Return list of recipes with ingredient details.

## Output
```json
{
  "target": "Thanatos",
  "recipes": [
    { "a": { "name": "Mot", "level": 71 }, "b": { "name": "Alice", "level": 45 } }
  ]
}


## `commands/validate-data.md`

```markdown
# Command: /validate-data

## Purpose
Run integrity checks on the entire persona database.

## Checks
1. Every persona has a valid arcana.
2. Every skill link points to an existing skill.
3. No orphaned fusion recipes.
4. Level ranges are consistent with arcana tier.
5. No duplicate names (case-insensitive).

## Output
List of violations with severity (error/warning).