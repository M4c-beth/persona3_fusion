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
