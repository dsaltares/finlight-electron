# Finlight — Coding Conventions

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- tRPC 11 + TanStack React Query 5
- Kysely (SQLite via better-sqlite3)
- Better Auth (Google OAuth)
- Tailwind CSS 4, shadcn/ui (Radix), Lucide + Tabler icons
- Zod 4 for validation, SuperJSON for serialization
- Biome for linting/formatting (not ESLint/Prettier)

## Commands

- `yarn dev` — dev server on port 3010
- `yarn build` — production build
- `yarn lint` / `yarn format` — Biome check/format
- `yarn migrate` — run database migrations
- `yarn gen-types` — regenerate Kysely types from DB schema

## Project Structure

```
next/
  app/              # Next.js App Router pages & layouts
  components/       # App components (PascalCase files)
  components/ui/    # shadcn/ui (auto-generated, don't edit)
  hooks/            # Custom React hooks
  lib/              # Client utilities (trpc, auth, format, utils)
  server/           # Server-side code
    trpc/           # tRPC router, procedures, middleware
    procedures/     # One file per resource (accounts, transactions, etc.)
    db.ts           # Kysely instances
    auth.ts         # Better Auth config
    kysely.ts       # Kysely types
  migrations/       # Kysely migrations
```

## Code Style

- **Formatting:** 2-space indent, single quotes, semicolons always (Biome enforced)
- **Imports:** Always use `@/` path alias — no relative imports
- **Components:** PascalCase filenames, default exports
- **Hooks:** `use` prefix, camelCase (e.g., `useFilters.ts`)
- **Utilities:** camelCase filenames, named exports
- **DB tables:** snake_case (`bank_account`), fields are camelCase (`createdAt`)
- **No console statements** — use Pino logger on server (`server/logger.ts`)
- **Function arguments**: functions can take max 2 arguments. If you need more, pass a single object with named properties. Define the type as FunctionNameArgs right above the function.

## tRPC Procedures

- One file per resource in `server/trpc/procedures/`, default-exported router object
- Three procedure types: `publicProcedure`, `authedProcedure`, `serverProcedure`
- Always validate input with Zod schemas
- Always check user authorization (`ctx.user`)
- Standard CRUD naming: `list`, `create`, `update`, `delete`
- Soft deletes via `deletedAt` field — always filter `.where('deletedAt', 'is', null)`

## Data Patterns

- All monetary amounts stored as **cents** (integers)
- Dates as ISO strings (`YYYY-MM-DD`)
- Transaction types: `Income`, `Expense`, `Transfer`
- Currency conversion uses cent-scaled exchange rates (4 decimal places)

## Client Patterns

- Server state via React Query: `.queryOptions()` / `.mutationOptions()`
- Form state via React Hook Form
- URL state via Nuqs
- Local UI state via useState/useCallback
- Toast notifications via Sonner (`toast.success()`, `toast.error()`)
- Class merging with `cn()` from `@/lib/utils`

## Styling

- Tailwind CSS 4 with CSS custom properties (OKLch colors)
- Dark mode support (`.dark` class)
- shadcn/ui components — use existing ones from `components/ui/`
- `--radius: 0` — no border radius in this project

## Git

- Kind of conventional commit style `git commit -m "<type>: <description>`.

## Comments

- No comments, self-explanatory code.