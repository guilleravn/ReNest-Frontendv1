# Coding style

## Folder structure: feature-based

```
src/
  app/                  # Routing only: page.tsx, layout.tsx, loading/error, route handlers.
                        # Thin: compose features, don't hold business logic.
  features/<feature>/   # Everything a feature owns (created as features are built):
    components/         #   UI for this feature
    api.ts              #   server-side calls to the backend (uses apiFetch)
    actions.ts          #   Server Actions ("use server") for mutations
    schemas.ts          #   zod schemas + inferred types for this feature's API data
    *.test.ts(x)        #   tests colocated with the code
  components/ui/        # Shared, feature-agnostic UI primitives (SegmentedTabs, Button, ...)
  components/layout/    # App shell: header, tab navigation, shared badges/icons
  lib/                  # Infrastructure: env, API client, query client, cn()
  test/                 # Vitest setup
e2e/                    # Playwright specs
```

A feature may import from `lib/` and `components/ui/`, but not from another feature's
internals. If two features need the same thing, promote it to `components/ui/` or `lib/`.

File names are kebab-case (`app-header.tsx`); components are PascalCase named exports
(`export function AppHeader`). Only Next.js file conventions (`page.tsx`, `layout.tsx`) use
default exports.

## Server Component / Client Component boundary

**Default is Server Component.** Pages, layouts and anything that only renders data stay on the
server: they can `await` backend data directly and ship no JS.

Add `"use client"` only when the component needs:

- state or effects (`useState`, `useReducer`, `useEffect`, ...)
- event handlers (`onClick`, `onChange`, interactivity beyond a plain Server Action form)
- browser APIs (`window`, `localStorage`, `IntersectionObserver`, ...)
- TanStack Query hooks or other client-only libraries

Keep client components as **leaves**: push `"use client"` as far down the tree as possible and
pass server-fetched data in as props. A client component can render server components passed as
`children`.

Code that must never reach the browser (`src/lib/env.ts`, `src/lib/api/server.ts`, feature
`api.ts` files) starts with `import "server-only"`, so importing it from a client component
fails the build.

## Calling the backend

The browser **never calls ReNest-Backend directly.** The JWT lives in an httpOnly cookie that
JavaScript cannot read, so every backend call happens on the Next.js server through `apiFetch`
([src/lib/api/server.ts](../../src/lib/api/server.ts)), which attaches
`Authorization: Bearer <jwt>` and validates the response with a zod schema.

| From                 | How                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server Component     | `await` a feature `api.ts` function directly                                                                                                               |
| Mutation from the UI | Server Action in the feature's `actions.ts` → `apiFetch`                                                                                                   |
| Client-side query    | `useQuery` → Route Handler in `src/app/api/...` → `apiFetch` (only when the data must refetch on the client; otherwise fetch on the server and pass props) |

The backend base URL is `API_URL` (server-only env var), read via `serverEnv()` in
[src/lib/env.ts](../../src/lib/env.ts). Never hardcode it.

## State management

**No global state library.** The decision is deferred until a real need shows up. Until then:

1. Server data → fetched in Server Components, or cached by TanStack Query on the client.
2. Shareable UI state (filters, tabs, pagination, search) → the URL (`searchParams`).
3. Local UI state → `useState` in the component that owns it.
4. Cross-component client state that doesn't fit the above → React context scoped to the subtree
   that needs it.

If a case comes up that none of these handles cleanly, propose a library (e.g. Zustand) in plan
mode with the concrete case; don't add one preemptively.

## API types

There is no backend contract yet (no OpenAPI), so types are **written by hand as zod schemas** in
each feature's `schemas.ts`, with `type X = z.infer<typeof xSchema>`. Every `apiFetch` call passes
a `schema`, so drift between frontend and backend fails loudly at the boundary instead of silently
in the UI.

Keeping in sync: when a backend endpoint changes, update the schema in the same slice as the UI
that uses it. If ReNest-Backend later exposes OpenAPI, switch to generated types (e.g.
`openapi-typescript`) and update this section.

## Styling

- **Tailwind first** for all styling. Use **CSS Modules** (`Component.module.css`) only for things
  Tailwind expresses poorly (complex animations, keyframes, third-party overrides).
- **Dark-only theme.** Design tokens are ported from the ReNest mockups and live as CSS variables
  in [src/app/globals.css](../../src/app/globals.css), exposed to Tailwind via `@theme inline`:
  - Raw palette: `--bg`, `--surface`, `--surface-sunken`, `--border`, `--text`, `--text-muted`,
    `--green-*`, `--blue-*`, `--amber-*`, status colors (`--success`, `--error`, `--verified`,
    ...), `--price`, `--focus`.
  - Semantic aliases with shadcn/ui names: `--background`, `--foreground`, `--primary`,
    `--secondary`, `--muted`, `--accent`, `--destructive`, `--ring`, ...
  - Classes: `bg-background`, `bg-surface`, `text-text-muted`, `bg-green-strong`,
    `border-border`, `outline-ring`, `shadow-[var(--shadow-card)]`, ...
  - To add a light theme later, override the raw palette under a selector; components don't
    change.
- Use token classes, not raw Tailwind colors (`text-text-muted`, not `text-stone-400`). Add a new
  token to `globals.css` before using a new color.
- **Fonts:** Urbanist is the default (`font-sans`), Diphylleia for headings (`font-heading`, applied
  to `h2`–`h4` by a base style in `globals.css`, as in the mockups),
  JetBrains Mono for code/numbers (`font-mono`).
- **Icons:** `lucide-react`. Custom SVG icons not in lucide go in
  `src/components/layout/icons.tsx` (or the feature's `components/`).
- Conditional classes: `cn()` from `@/lib/cn`.
- In-page tab switchers (Agendadas/Completadas, En proceso/Activos/...) use `SegmentedTabs` from
  `@/components/ui/segmented-tabs`, with the active tab in the URL (`?tab=...`), not in state.
- Never render made-up data in the UI. Counts, names and badges come from the backend; without
  data, render nothing (or an empty state), not a hardcoded value.
- Class order is enforced by `prettier-plugin-tailwindcss` (configured with
  `tailwindStylesheet` so it knows our custom tokens); run `npm run format`.

## TypeScript

- `strict` mode. No `any`; parse unknown data with zod instead of casting.
- Import alias: `@/*` → `src/*`.
