# Naming and casing

| Element                     | Convention                                        | Example                                              |
| --------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| `.ts/.tsx` files (all)      | kebab-case                                        | `listing-card.tsx`, `query-client.ts`                |
| Next special files          | fixed lowercase name                              | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| CSS Modules                 | kebab-case, same name as the component            | `listing-card.module.css`                            |
| Tests                       | colocated `<file>.test.ts(x)`; e2e `*.spec.ts`    | `listing-card.test.tsx`, `e2e/login.spec.ts`         |
| Folders / features          | kebab-case                                        | `features/saved-searches/`                           |
| Route segments (URL)        | kebab-case                                        | `app/saved-searches/page.tsx`                        |
| Dynamic segments            | camelCase in brackets, with an `Id` suffix        | `[listingId]`, not `[id]` or `[listing_id]`          |
| Route groups                | kebab-case in parentheses                         | `(auth)`, `(dashboard)`                              |
| Components                  | PascalCase, noun                                  | `ListingCard`, `LoginForm`                           |
| Page/layout component       | PascalCase + `Page`/`Layout` suffix               | `export default function ListingsPage()`             |
| Hooks                       | camelCase with `use` prefix                       | `useDebouncedValue`, `useListingFilters`             |
| Internal handlers           | `handle` + event/action                           | `handleSubmit`, `handleDeleteClick`                  |
| Callback props              | `on` + event                                      | `onSelect`, `onDeleteClick`                          |
| Booleans (vars and props)   | `is`/`has`/`should`/`can` + adjective             | `isOpen`, `hasError`, `canEdit`                      |
| Variables / functions       | camelCase; functions start with a verb            | `formatPrice`, `getListing`                          |
| `useState` state            | `[thing, setThing]`                               | `[query, setQuery]`                                  |
| Refs                        | `Ref` suffix                                      | `inputRef`                                           |
| Types and props             | PascalCase; props = `<Component>Props`            | `ListingCardProps`, `Listing`                        |
| Generics                    | `T` if a single trivial one; otherwise `T` + name | `T`, `TData`, `TValue`                               |
| zod schemas                 | camelCase + `Schema`; inferred type has no suffix | `listingSchema` → `type Listing`                     |
| Module constants (literals) | UPPER_SNAKE_CASE                                  | `AUTH_COOKIE`, `MAX_UPLOAD_MB`                       |
| Config maps with `as const` | UPPER_SNAKE_CASE                                  | `STATUS_LABELS`, `BUTTON_VARIANTS`                   |
| Server Actions              | verb + resource + `Action`                        | `createListingAction`                                |
| `api.ts` functions          | verb + resource                                   | `getListing`, `listListings`, `createListing`        |
| Context                     | `XContext`, `XProvider`, hook `useX`              | `FiltersContext`, `FiltersProvider`, `useFilters`    |
| Query keys / options        | `<resource>Queries` with `queryOptions`           | `listingQueries.detail(listingId)`                   |
| Environment variables       | UPPER_SNAKE; `NEXT_PUBLIC_` only if browser-bound | `API_URL`, `NEXT_PUBLIC_MAPS_KEY`                    |
| CSS classes (Modules)       | camelCase (used as `styles.cardHeader`)           | `.cardHeader`                                        |
| Design tokens (CSS vars)    | semantic kebab-case                               | `--surface`, `--accent` → `bg-surface`               |
| `data-testid` (last resort) | kebab-case                                        | `data-testid="listing-map"`                          |
| Union values / `status`     | lowercase (kebab-case if several words)           | `"idle" \| "pending" \| "success"`                   |
| `useReducer` action types   | camelCase, past tense                             | `{ type: "itemAdded" }`                              |

Notes:

- ✅ File name = main component in kebab-case (`ListingCard` → `listing-card.tsx`). One exported
  component per file; private helpers may live in the same file.
- ✅ Compound components use a flat prefix (`Tabs`, `TabsList`, `TabsTrigger`), not `Tabs.List`.
- ❌ Opaque abbreviations (`lst`, `btnCb`); ❌ booleans without a prefix (`open`, `loading`)
  unless they are native HTML attributes (`disabled`, `required`, `checked`).
