# Naming Conventions

## Personas
- Use official English localization names.
- Preserve hyphens: "Izanagi-no-Okami", not "Izanagi no Okami".
- Preserve diacritics where canon: "Mahamayuri", not "Mahamaya".

## Arcana
- Use capitalized singular: "Death", not "deaths".
- Enum values: `Arcana.DEATH`, `Arcana.FOOL`.

## Elements
- Lowercase in code: `fire`, `ice`, `elec` (not `electricity`).
- Affinity levels: `weak`, `normal`, `resist`, `null`, `repel`, `absorb`.

## API Routes
- Plural nouns: `/personas`, `/skills`, `/arcana`.
- Kebab-case for multi-word: `/fusion-recipes`.

## Database
- Table names: PascalCase singular (`Persona`, `Skill`).
- Column names: camelCase (`arcanaId`, `level`).
- Foreign keys: `<entity>Id` (e.g., `personaId`).