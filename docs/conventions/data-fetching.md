# Server/Client Components and data fetching

## Server Component / Client Component boundary

**Default is Server Component.** Pages, layouts and anything that only renders data stay on the
server: they can `await` backend data directly and ship no JS.

Add `"use client"` only when the component needs:

- state or effects (`useState`, `useReducer`, `useEffect`, ...)
- event handlers (`onClick`, `onChange`, interactivity beyond a plain Server Action form)
- browser APIs (`window`, `localStorage`, `IntersectionObserver`, ...)
- TanStack Query hooks or other client-only libraries

Keep client components as **leaves**: push `"use client"` as far down the tree as possible and
pass server-fetched data in as props. ❌ `"use client"` on a whole page/layout for one
interactive button. A client component can render server components passed as `children`.

- ❌ Passing non-serializable props (functions, classes) or sensitive data (tokens, internal
  fields) to a Client Component: pass only the fields the UI uses.

Code that must never reach the browser (`src/lib/env.ts`, `src/lib/api/server.ts`, feature
`api.ts` files, anything that reads env vars or cookies or calls the backend) starts with
`import "server-only"`, so importing it from a client component fails the build (INV-3).

## Calling the backend

The browser **never calls ReNest-Backend directly** (INV-1). The JWT lives in an httpOnly cookie
that JavaScript cannot read, so every backend call happens on the Next.js server through
`apiFetch` ([src/lib/api/server.ts](../../src/lib/api/server.ts)), which attaches
`Authorization: Bearer <jwt>` and validates the response with a zod schema.

| From                 | How                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server Component     | `await getListing(id)` from the feature's `api.ts`                                                                                                         |
| Mutation from the UI | Server Action in the feature's `actions.ts` → `apiFetch`                                                                                                   |
| Client-side query    | `useQuery` → Route Handler in `src/app/api/...` → `apiFetch` (only when the data must refetch on the client; otherwise fetch on the server and pass props) |

- ✅ Every `apiFetch` call passes a `schema` (INV-2). ❌ `as Listing` over network data.
- ❌ Invented endpoints or response shapes: if it isn't in [architecture.md](../architecture.md),
  ask.
- The backend base URL is `API_URL` (server-only env var), read via `serverEnv()` in
  [src/lib/env.ts](../../src/lib/env.ts). Never hardcode it.
- ✅ `params`/`searchParams` are `await`ed; type them with the global helpers
  `PageProps<"/listings/[listingId]">` / `LayoutProps<"/">`.
- ✅ Independent requests in parallel (`Promise.all`) or in separate `<Suspense>` boundaries; ❌
  sequential `await` waterfalls without a real dependency.

## API types

There is no backend contract yet (no OpenAPI), so types are **written by hand as zod schemas** in
each feature's `schemas.ts`, with `type X = z.infer<typeof xSchema>`. Every `apiFetch` call passes
a `schema`, so drift between frontend and backend fails loudly at the boundary instead of silently
in the UI.

Keeping in sync: when a backend endpoint changes, update the schema in the same slice as the UI
that uses it. If ReNest-Backend later exposes OpenAPI, switch to generated types (e.g.
`openapi-typescript`) and update this section.

## TanStack Query (client only)

- ✅ Keys and options centralized per feature (`queries.ts`) with `queryOptions`; keys are
  hierarchical from general to specific, resource in plural, and **everything the `queryFn` uses
  goes in the key**:

```ts
export const listingQueries = {
  all: () => ["listings"] as const,
  list: (filters: ListingFilters) =>
    queryOptions({
      queryKey: [...listingQueries.all(), "list", filters],
      queryFn: () => fetchListings(filters),
    }),
  detail: (listingId: string) =>
    queryOptions({
      queryKey: [...listingQueries.all(), "detail", listingId],
      queryFn: () => fetchListing(listingId),
    }),
};
```

- ✅ The `queryFn` throws if `!res.ok` and validates with zod. ❌ caching a 500 as data.
- ✅ `isPending` for the main loading state; `isFetching` only for subtle indicators.
- ✅ After a mutation: `invalidateQueries` by prefix. Optimistic updates only if the plan asks
  for them, with `cancelQueries` → snapshot → immutable `setQueryData` → rollback in `onError` →
  invalidate in `onSettled`.
- ❌ Creating a `QueryClient` in a component: use `getQueryClient()` from `lib/query-client.ts`.
- ❌ Tokens or other secrets inside query keys.
