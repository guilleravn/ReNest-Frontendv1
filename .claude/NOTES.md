# Agent notes

Shared log between the issue-implementer and qa-reviewer agents, and context for the user and
future runs. Only what is relevant and **not already in the plan or the issue**: deviations,
decisions taken, risks, open questions. Newest first.

Format:

```
## YYYY-MM-DD · <issue code> · <agent>
- <note>
```

---

## 2026-10-06 · BO-43 (QA changes requested) · frontend-issue-implementer

- `SearchField` now follows `?q=` after navigations it didn't make (home link, back/forward),
  using the "adjust state during render" pattern with two states: the previous `defaultQuery`
  (to notice a change) and the query the field expects next (its own last request, or the last
  synced value). Its own search landing never overwrites what the user is still typing, and its
  own clear doesn't flash the old text back while the request is in flight. No `key={q}` remount,
  so focus is kept.
- Removed `outline-none` from the search input: in Tailwind 4 it sets
  `--tw-outline-style: none`, which also cancelled the `focus-visible:outline-2` ring.
- Screen-reader announcements: one persistent `role="status"` (`sr-only`) region on the feed page,
  outside the keyed results `<Suspense>`, holds its own `<Suspense key={q}>` whose text goes
  "Cargando artículos…" → "N artículos encontrados." / the no-match or empty-feed copy
  (`feed-announcement.ts`, `FeedStatus`). The visible count, `FeedSkeleton` and `EmptyFeed` are
  no longer live regions. The wording deliberately differs from the visible "N resultados" so
  text queries don't match both. `getFeed` is wrapped in React `cache()` (keyed on the `q`
  string), so the two boundaries share one backend call per request.
- E2E now run: `feed.spec.ts` + `app-shell.spec.ts`, 36/36 (desktop + mobile), against a
  production build on :3001 and the backend Docker API with its feed seed.

## 2026-10-06 · BO-43 (BO-5) · frontend-issue-implementer

- `feed/error.tsx` also renders the page `<h1>`: the segment's error boundary replaces the whole
  page, and `e2e/app-shell.spec.ts` expects that heading on `/feed` even without a backend. The
  search field isn't shown in the error state (retry reloads the same `?q=`).
- `parseSearchQuery` truncates to 120 chars instead of dropping the value: the backend 400s above
  120 and that would land on the error page; the input also has `maxLength={120}`.
- `getFeed` only forwards `q`. The backend rejects unknown params with 400, so the `?category=`
  that `buildFeedSearchHref` keeps in the URL must not reach `GET /feed` until C2 agrees it.
- Count copy is singular for one result ("1 resultado"), as in the reference. "N" is
  `meta.total`; the count is not shown on the empty state (the reference doesn't either).
- (Re-sync part superseded: see the "QA changes requested" entry above.) `SearchField` has one
  `useEffect`, only to clear the pending debounce timer on unmount, so a
  late `router.replace` can't pull the user back to `/feed` after they navigate away. The input
  is not re-synced with `?q=` on back/forward navigation (would need deriving state from props);
  the results do follow the URL. Flag it if product wants that.
- Card photo `alt=""` (decorative, title is in the link name), unlike the reference which uses
  the title as alt and so reads it twice. No location line or condition/verified badges on cards:
  not in the `GET /feed` contract.
- `SearchField` tests: Vitest fake timers need `shouldAdvanceTime: true` (Testing Library waits on
  a real `setTimeout(0)` after each interaction and only flushes Jest's fake timers).
- (Superseded: e2e now run, see above.) E2E `e2e/feed.spec.ts` assumes the backend seed's ACTIVE listings include "Leather armchair",
  "Oak armchair" and "Desk lamp", and that "armchair" matches exactly 2 titles. Not run yet: the
  backend's feed seed wasn't in place. UI was checked against a local mock at 1440/1024/768/375/
  320px (no horizontal scroll) and in both themes.

## 2026-10-06 · BO-41 (PR #7 review) · frontend-qa-reviewer

- `/listings` now follows the reference app's own "Mis artículos" screen, not `/purchases`: tabs
  "En proceso" (default, bare `/listings`) / "Activos" / "Completados" as pill chips
  (`components/ui/chip-tabs.tsx`), and listing rows (thumbnail, title, price, status chip) instead
  of a photo grid. The reference uses a segmented control on `/purchases` and chips on
  `/listings`, so each screen keeps its own.
- Not built, on purpose: the "En proceso" count badge (needs a count the page doesn't fetch;
  belongs with the nav badge `listingsInProgressCount`, BO-28) and the buyer/pickup line on
  in-progress rows (`GET /listings` has no buyer or pickup fields; never invent them).
- Loading: `<Suspense key={status}>` + `ListingsSkeleton` around the fetch. Error: `error.tsx`
  with a generic message and `retry()`. Per-status copy is not possible there: in production,
  Server Component errors reach `error.tsx` without message or status. 401 handling belongs to
  the login story (BO-39, see architecture.md "Route protection").
- Prices are formatted as USD (`$1,500`), per ReNest-Backend's business-invariants.md (decided
  2026-10-06). `priceCents` is validated as a non-negative integer.
- `meta.total` > rows shown → "Mostrando N de M publicaciones." (no pagination UI yet).
- E2E `e2e/listings.spec.ts` needs ReNest-Backend's Docker stack (seed has one listing per
  status). The empty and error states can't be reached from Playwright (the fetch is
  server-side, so `page.route` can't mock it, and the seed has no empty status): they are covered
  by unit tests.

## 2026-10-06 · BO-41 · frontend-qa-reviewer

- Fixed an SSRF/open-proxy finding flagged during implementation but not yet fixed:
  `next.config.ts` had `images.remotePatterns: [{ protocol: "https", hostname: "**" }]`, which
  turns `next/image`'s optimizer into an open proxy for any HTTPS URL. Changed to
  `images: { unoptimized: true }` until a real S3/R2 bucket/CDN hostname exists to allow-list.
- Found (via the real ReNest-Backend running locally during this review) that `Listing.photoUrl`
  is **not** an absolute URL despite its name: it's the raw storage key
  (`listing.photos[0]?.storageKey`, e.g. `"listings/<id>/photo-0.jpg"`), confirmed in
  `ReNest-Backend/src/listings/listings.service.ts`. The original schema (`z.string()`) happened
  to accept this by coincidence; tightening it to `z.url()` (my first attempt) broke every real
  response with a `ZodError`/500. Also `photoUrl` can be `null` (zero photos at the DB level) and
  the original schema didn't allow that either.
  - Fixed: `photoUrl: z.string().nullable()` in `src/features/listings/schemas.ts`.
  - Added `src/features/listings/photo-url.ts` (`isRenderablePhotoUrl`): until a public
    bucket/CDN base URL exists, the UI treats any non-absolute-URL `photoUrl` the same as "no
    photo" (placeholder icon) instead of emitting a broken `<img>` pointed at a relative path.
  - **Open question for product/next ticket**: once real uploads exist (Epic 4, S3/R2), decide
    whether the backend should return a full URL, or the frontend gets a base media URL env var
    to prefix the storage key. Whoever builds that slice should also delete the
    `isRenderablePhotoUrl` workaround.
- Judgment calls, not blocking: status tabs kept uppercase in hrefs (`?status=PENDING`, matching
  the wire contract) instead of lowercase like `/purchases` — acceptable, avoids a translation
  layer; price formatting (superseded: prices are USD, see the PR #7 review entry above);
  listing cards link to the still-placeholder `/listings/[listingId]`.
- (Superseded: addressed in the PR #7 review entry above.) Not addressed, flagged for awareness: no `loading.tsx`/`error.tsx` exist anywhere in the app
  yet (this is the first page doing a real server-side fetch), so a backend 500/network failure
  currently falls through to Next's default unstyled error page instead of a styled error state.
  Frontend-invariants.md lists loading/error-state rules as TBD; out of scope for BO-41's AC
  (status tabs + empty state), but worth a dedicated slice soon given this is now a real pattern
  other pages will repeat.

## 2026-10-05 · app shell · main session

- Routes and shells mirror the reference app (see architecture.md "Routes" / "App shell").
  `/listings/new` and `/listings/[listingId]` stay under `(tabs)`, as in the reference; their
  inner sub-header (back to `/listings`) belongs to those pages, not to the shell.
- Nav badges (`scheduledPurchasesCount`, `listingsInProgressCount`) and the avatar initial are
  optional props, never hardcoded. Layouts don't pass them until the backend has endpoints
  (open question in architecture.md). Meanings inferred from the reference: purchases with a
  scheduled pickup, and listings with a sale in progress.
- Icons are inline SVG copies (`components/layout/icons.tsx`) instead of adding `lucide-react`.
- The avatar is not interactive yet: the account menu (logout) comes with the login flow.
- `<html lang>` switched to `es`, since the UI copy is Spanish.
- The previous port of `feat/app-shell` (branch `feat/layout`) is kept in `git stash` as
  "feat/layout: previous app shell port", not reused.
