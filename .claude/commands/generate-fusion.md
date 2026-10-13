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
```
