# Project structure

## Dependencies

The stack is listed in [architecture.md](../architecture.md#stack). There is **no** form library,
global state library, UI kit, `react-error-boundary`, MSW or `clsx`: don't add them (or any other
dependency) without proposing it in the plan. A slice that installs or removes a dependency
updates the stack table in the same commit.

Next.js 16 has breaking changes (`proxy.ts` instead of `middleware.ts`; `params`,
`searchParams`, `cookies()` and `headers()` are async). Before using any Next API, read
`node_modules/next/dist/docs/`.

## Folders: feature-based

```
src/
  app/                          # Routing only: page, layout, loading/error, route handlers.
                                # Thin: composes features, holds no business logic.
    (auth)/login/page.tsx       #   route group (does not affect the URL)
    listings/[listingId]/page.tsx
    api/<resource>/route.ts     #   Route Handlers (only if the client needs to refetch)
  features/<feature>/           # kebab-case, plural domain noun: listings, auth
    components/                 #   UI for this feature
    api.ts                      #   server-side backend calls (import "server-only" + apiFetch)
    actions.ts                  #   Server Actions ("use server") for mutations
    schemas.ts                  #   zod schemas + inferred types for this feature's API data
    queries.ts                  #   TanStack Query queryOptions/keys (if there are client queries)
    *.test.ts(x)                #   tests colocated with the code
  components/ui/                # Shared, feature-agnostic UI primitives (Button, TextField, ...)
  components/layout/            # App shell: header, tab navigation, back link (architecture.md)
  lib/                          # Infrastructure: env, API client, query client
  test/                         # Vitest setup
e2e/                            # Playwright specs (*.spec.ts)
```

Feature folders are created as features are built.

## Imports

- ✅ A feature imports from `lib/` and `components/ui/`; ❌ never from another feature's
  internals. If two features need the same thing, promote it to `components/ui/` or `lib/`.
- ✅ Use the `@/…` alias (`@/*` → `src/*`) to cross folders; relative (`./`) only within the same
  folder.
- ❌ Barrels (`index.ts` files that re-export everything): they break tree-shaking and mix
  server/client code.
- Import order (what the repo already does): external → `@/…` → relative, with a blank line
  between groups; `import type` for type-only imports.
