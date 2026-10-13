# Command: /add-skill

## Purpose
Add a new skill to the database.

## Usage
Add-skill --name "Megidolaon" --type almighty --power 150 --cost 40

## Steps
1. Validate skill name uniqueness.
2. Validate type is in allowed enum.
3. Insert into `Skill` table.
4. Return created skill ID.

## Validation Rules
- Name: 2–40 chars.
- Type: slash | strike | pierce | fire | ice | elec | wind | light | dark | almighty | heal | ailment | support | passive.
- Power: integer 0–999 (0 for passive).
- Cost: integer 0–999 SP.