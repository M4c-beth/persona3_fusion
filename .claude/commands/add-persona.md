# Command: /add-persona

## Purpose
Add a new persona to the database with full validation.

## Usage
Add-persona --name "Thanatos" --arcana Death --level 57

## Steps
1. Validate name uniqueness.
2. Validate arcana is a valid Major Arcana.
3. Validate level is 1–99.
4. Insert into `Persona` table.
5. Link default skills if provided.
6. Return the created persona ID.

## Validation Rules
- Name: 2–40 chars, alphanumeric + spaces + hyphens.
- Arcana: must be a value of the `Arcana` enum.
- Level: integer 1–99.
- Stats: each 1–99.