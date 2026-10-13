# Coding Standards

## Language
- **Frontend**: TypeScript (strict mode), React 18+, Next.js 14+ (App Router).
- **Backend**: TypeScript, Node 20+, tRPC or REST.
- **Database**: PostgreSQL 16, Prisma ORM.
- **Styling**: Tailwind CSS + shadcn/ui.

## TypeScript
- Enable `strict: true` in tsconfig.
- No `any` — use `unknown` + type guards.
- Prefer interfaces for object shapes, types for unions.
- Use `zod` for runtime validation of all external data.

## File Organization
src/
├── app/              # Next.js routes
├── components/       # Reusable UI
│   ├── ui/           # shadcn primitives
│   └── features/     # Feature-specific components
├── lib/              # Utilities, helpers
├── server/           # Backend logic (tRPC routers)
├── db/               # Prisma schema, seeds
└── types/            # Shared TypeScript types

## Conventions
- Components: PascalCase (`PersonaCard.tsx`)
- Utilities: camelCase (`formatLevel.ts`)
- Constants: UPPER_SNAKE (`MAX_PERSONA_LEVEL`)
- One component per file.
- Co-locate tests with source (`PersonaCard.test.tsx`).