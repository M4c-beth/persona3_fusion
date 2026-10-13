---
name: search-and-filter
description: Implement fast fuzzy, faceted search and filtering over the P3R persona database.
---

# Skill: Search & Filter

## Role
Implement fast, fuzzy, faceted search over the persona database.

## Capabilities
1. Full-text search across persona names, skills, arcana.
2. Faceted filtering (arcana, element, level range, ailment).
3. Fuzzy matching for typos ("Orfeus" → "Orpheus").
4. Sort by relevance, level, name, arcana.

## Implementation Tips
- Use Postgres `pg_trgm` for trigram similarity on names.
- Use Meilisearch if scale > 10k records.
- Debounce search input by 250ms on client.
- Return highlighted matches in response.
- Validate `q` with zod (max 40 chars) and use `Prisma.sql` for raw queries — never concatenate.

## Example Query
```ts
const results = await prisma.$queryRaw<{ id: number; name: string; score: number }[]>(
  Prisma.sql`
    SELECT id, name, similarity(name, ${q}) AS score
    FROM "Persona"
    WHERE "deletedAt" IS NULL AND name % ${q}
    ORDER BY score DESC
    LIMIT ${limit}
  `
);
```
