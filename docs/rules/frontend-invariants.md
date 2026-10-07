# Frontend invariants

Rules that must hold across the app. Each one states what it requires, what it protects, and how
it fails if broken. **The app is just starting: most rules are TBD and get added as features are
built.** Add a rule here in the same slice that introduces it.

## INV-1: The JWT never reaches browser JavaScript

- **Requires:** The token is stored only in the httpOnly cookie `renest_token`. Backend calls go
  through `apiFetch` on the server. No token in `localStorage`, `sessionStorage`, client state,
  props passed to client components, or `NEXT_PUBLIC_*` env vars.
- **Protects:** User sessions against token theft via XSS.
- **Fails as:** A token visible in DevTools > Application > Local Storage, readable from
  client-side JS, or sent from the browser directly to the backend.

## INV-2: Backend data is validated at the boundary

- **Requires:** Every `apiFetch` call passes a zod `schema`.
- **Protects:** The UI from silently rendering wrong or missing data when the backend contract
  changes.
- **Fails as:** `undefined`/`NaN` rendered in the UI, or runtime errors deep in components
  instead of a clear zod error at the call site.

## INV-3: Server-only modules stay server-only

- **Requires:** Modules that read env vars, cookies or call the backend start with
  `import "server-only"`.
- **Protects:** Secrets and backend URLs from leaking into the client bundle.
- **Fails as:** A build error when a client component imports them (the intended failure). If the
  guard is missing, secrets ship to the browser silently.

## INV-4: Every screen works from 320px to wide desktop

- **Requires:** Layouts are built desktop-first ([styling.md](../conventions/styling.md)) and every
  page stays usable at any viewport width from **320 CSS px** to wide desktop (1920px and up).
  The page has no horizontal scroll, text is not clipped or overlapping, and every action and
  piece of content is reachable, possibly behind a menu or disclosure. The viewport keeps
  Next's default `width=device-width, initial-scale=1`, and zoom is never disabled.
- **Protects:** Users on phones, tablets, split-screen and zoomed browsers (WCAG 2.2 1.4.10
  Reflow, which equals 320px at 400% zoom).
- **Fails as:** A sideways-scrolling page or controls pushed off-screen on a phone, or a layout
  that only works at the width it was built at. Typical causes: a fixed `w-[…px]`, a
  `col-span-*` or `col-start-*` that was not reset, or a missing `min-w-0`.

## UI states: loading, error and empty

Established by `/listings` (BO-40/BO-41) and `/feed` (BO-45); followed by every data view since.

- **Loading:** either the segment's `loading.tsx`, or a `<Suspense fallback={<XSkeleton />}>`
  placed as close as possible to the slow fetch when only part of the page needs it (e.g. the
  result grid in a `<Suspense key={filters}>`, keyed so changing a filter shows the skeleton
  again instead of stale results). The skeleton matches the final content's dimensions and layout
  (no shift), is `aria-busy` + `aria-live="polite"` with a `sr-only` status text, and its
  placeholder rows are `aria-hidden`. Precedent: `ListingsSkeleton`, `FeedSkeleton`.
- **Error:** `error.tsx` per segment (a Client Component). Copy stays generic — never
  `error.message` or the HTTP status — because Server Component errors reach the client without
  them in production. A `role="alert"` message plus a "Reintentar" button calling `retry()`.
  Precedent: `src/app/(tabs)/listings/error.tsx`, `src/app/(tabs)/feed/error.tsx`.
- **Empty:** a small, server-rendered, prop-driven component with copy specific to _why_ the list
  is empty — never one generic "no results" string for every case when the active filters imply a
  more specific message exists. `EmptyListings` varies by status (one case); `EmptyFeed` varies by
  which filters are active (four cases: none, category only, search only, both — the combined case
  is BO-6's "no items match" acceptance criterion). Precedent:
  `src/features/listings/components/empty-listings.tsx`,
  `src/features/feed/components/empty-feed.tsx`.

## TBD

- Auth/route protection rules (once the login flow exists).
- Form validation and error-display rules.
