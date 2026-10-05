# Common mistakes to avoid

Review checklist for implementers (before handing off) and QA (while reviewing). Each item links
to the doc with the full rule.

1. Inventing endpoints, response fields or UX rules that are not in the plan/issue
   ([architecture.md](../architecture.md)).
2. Calling the backend from the browser or passing the JWT to a Client Component (INV-1,
   [frontend-invariants.md](frontend-invariants.md)).
3. `apiFetch` without a `schema` (INV-2), or `as Listing` over network data.
4. Forgetting `import "server-only"` in `api.ts`, `env.ts` or any module holding secrets (INV-3).
5. `"use client"` on an entire page/layout for a single interactive button
   ([data-fetching.md](../conventions/data-fetching.md)).
6. `useEffect` to fetch or to derive state; a `QueryClient` created inside a component
   ([components-and-state.md](../conventions/components-and-state.md)).
7. New env vars without an entry in `.env.example` and in the `lib/env.ts` schema;
   `NEXT_PUBLIC_` for something the browser doesn't need.
8. Forgetting that `params`, `searchParams`, `cookies()` and `headers()` are Promises in Next 16;
   writing `middleware.ts` instead of `proxy.ts`.
9. `redirect()` inside `try/catch` ([forms-and-errors.md](../conventions/forms-and-errors.md)).
10. A data view without an empty or error state; `error.tsx` without `"use client"`.
11. Raw Tailwind colors or interpolated classes ([styling.md](../conventions/styling.md)).
12. Responsive layout (INV-4, [styling.md](../conventions/styling.md)):
    - Using min-width variants (`md:`) for layout instead of desktop-first `max-*`, or mixing
      both directions on one property.
    - Fixed pixel widths on containers.
    - Desktop grid placements (`col-span-3`, `col-start-*`) left active on narrower screens.
    - Not checking the screen at 320px.
13. Inputs without labels, icon-only buttons without a name, clickable `div`s
    ([accessibility.md](../conventions/accessibility.md)).
14. Tests using `getByTestId`/`container.querySelector` by habit, `fireEvent`, or mocks that are
    never restored ([testing.md](../conventions/testing.md)).
15. Adding dependencies (global state, forms, UI kit, `clsx`, MSW) without proposing them in the
    plan.
16. Changing dependencies without updating the stack table in
    [architecture.md](../architecture.md#stack) in the same commit.
