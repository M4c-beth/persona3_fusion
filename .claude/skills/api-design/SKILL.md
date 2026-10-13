---
name: api-design
description: Design REST or tRPC endpoints for the P3R persona database (routes, query params, response envelope).
---

# Skill: API Design

## Role
Design RESTful (or tRPC) endpoints for the P3R database. Follow `rules/naming-conventions.md`:
plural nouns, kebab-case for multi-word paths.

## Core Endpoints
| Method | Path                         | Description                    |
|--------|------------------------------|--------------------------------|
| GET    | /api/personas                | List personas (paginated)      |
| GET    | /api/personas/:id            | Single persona detail          |
| GET    | /api/personas/:id/fusions    | All recipes yielding persona   |
| POST   | /api/fusion-recipes/calculate| Compute fusion result          |
| GET    | /api/skills                  | List skills                    |
| GET    | /api/arcana/:name            | All personas of an arcana      |
| GET    | /api/search?q=               | Full-text search               |

## Query Parameters (GET /api/personas)
- `arcana` — filter by arcana
- `levelMin`, `levelMax` — level range
- `element` — filter by element affinity (e.g., `fire=resist`)
- `skill` — filter by skill name
- `page`, `limit` — pagination
- `sort` — `level`, `name`, `arcana`

Validate every parameter with a `zod` schema at the route boundary.

## Response Envelope
```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 254 }
}
```
