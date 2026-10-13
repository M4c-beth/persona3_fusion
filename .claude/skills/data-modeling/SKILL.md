---
name: data-modeling
description: Design normalized, query-optimized Prisma/PostgreSQL schemas for the P3R persona database.
---

# Skill: Data Modeling

## Role
Design normalized, query-optimized schemas for the P3R persona database.
Follow `rules/naming-conventions.md`: PascalCase singular tables, camelCase columns,
`<entity>Id` foreign keys.

## Core Entities
- `Persona` — main entity
- `Skill` — reusable skill definitions
- `Arcana` — enum
- `Element` — enum of damage types
- `PersonaSkill` — many-to-many (persona ↔ skill with slot index)
- `FusionRecipe` — (`resultId`, `ingredientAId`, `ingredientBId`)
- `FusionSpecial` — special fusion overrides

## Stack
- **ORM**: Prisma (per `rules/coding-standards.md`)
- **Database**: PostgreSQL 16 (JSONB for element affinities)
- **Cache**: Redis for hot fusion queries
- **Search**: Postgres full-text / `pg_trgm` (Meilisearch only if scale demands it)

## Schema Principles
1. Normalize skills into a separate table; arcana and affinity levels are enums.
2. Store element affinities as a JSONB map for fast reads.
3. Index fusion queries on `(arcana, level)`.
4. Soft-delete personas (don't hard-delete game data).

## Example Prisma Snippet
```prisma
model Persona {
  id        Int            @id @default(autoincrement())
  name      String         @unique
  arcana    Arcana
  level     Int
  stats     Json           // { str, mag, end, agi, luc }
  elements  Json           // { fire: "resist", ice: "weak", ... }
  deletedAt DateTime?
  skills    PersonaSkill[]
  recipesA  FusionRecipe[] @relation("IngredientA")
  recipesB  FusionRecipe[] @relation("IngredientB")
  results   FusionRecipe[] @relation("Result")

  @@index([arcana, level])
}

model FusionRecipe {
  id            Int     @id @default(autoincrement())
  resultId      Int
  ingredientAId Int
  ingredientBId Int
  result        Persona @relation("Result", fields: [resultId], references: [id])
  ingredientA   Persona @relation("IngredientA", fields: [ingredientAId], references: [id])
  ingredientB   Persona @relation("IngredientB", fields: [ingredientBId], references: [id])

  @@unique([resultId, ingredientAId, ingredientBId])
}
```
