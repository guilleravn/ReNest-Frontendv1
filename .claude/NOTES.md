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

## 2026-10-07 · BO-45 (QA fixes) · frontend-issue-implementer

- **Resolved the 2026-10-06 schema-discrepancy note below**: no discrepancy. ReNest-Backend's
  `[BE]` sub-issue is now finished and merged on this branch, and its real `GET /feed` returns
  exactly `id, title, priceCents, photoUrl, status, createdAt` — no `categoryId`/`sellerId`.
  Removed both optional fields from `listingSchema` (`src/features/feed/schemas.ts`) so it matches
  `features/listings/schemas.ts`'s shape exactly, per the "never invent fields beyond the real
  contract" convention. Updated `docs/architecture.md`'s "Notes on `GET /feed`" and the fixtures in
  `schemas.test.ts`/`feed-item-card.test.tsx` accordingly.
- Also fixed, from this QA pass: the debounce timer now checks the trimmed pending search against
  the current `search` URL prop before calling `router.replace`, instead of trying to track "did
  the user type" via refs — makes a stale timer a no-op instead of an overwrite (closes the
  `--repeat-each` flake in `e2e/feed.spec.ts`'s category-toggle test, and the equivalent prod race
  of typing then clicking a category chip within 400ms). `FeedSearch`'s local `search` state now
  also re-syncs when the `search` prop changes for a reason other than its own debounce (browser
  back/forward), via the "adjust state during render" pattern, instead of a one-time `useState`
  seed. `feed-filters.ts`'s `parseCategory`/`parseSearch` now drop an invalid slug or an
  over-100-char search instead of passing them to the backend and tripping the route's generic
  `error.tsx`; `feed-search.tsx`'s input also got `maxLength={100}` to stop most of this at the
  source.

## 2026-10-06 · BO-45 · frontend-issue-implementer

- **Schema discrepancy found against the live, in-progress backend:** the plan described
  `GET /feed`'s `Listing` item as including `categoryId`/`sellerId`, but ReNest-Backend's actual
  `[BE]` sub-issue (checked by running its real Docker stack while it was still mid-implementation,
  uncommitted) currently returns the exact same fields as `GET /listings` — no `categoryId` or
  `sellerId`. Rather than hard-failing every real response, `listingSchema` in
  `src/features/feed/schemas.ts` keeps both fields **optional**: validates the current shape and a
  future one that adds them. Nothing in the UI reads either field yet (no category badge or seller
  snapshot in this slice). Revisit once BO's `[BE]` sub-issue is actually done.
- **Feature-isolation tradeoff:** `project-structure.md` forbids a feature importing another
  feature's internals, so `features/feed/` duplicates (rather than imports)
  `features/listings/schemas.ts`'s `Listing`/`listingSchema` shape, plus the whole of
  `photo-url.ts` and `price.ts` verbatim. Flagged as a candidate for promoting to `src/lib/` in a
  future slice that's allowed to touch both feature folders (this one wasn't, per its owned-files
  list).
- **Found and fixed a real race condition**, not just a test flake: `FeedSearch`'s original
  debounce effect depended on both `search` _and_ `category`, so clicking a category chip (a plain
  `<Link>` navigation) would re-trigger the 400ms debounce timer too. If the user interacted again
  within that window — e.g. clicking the same category chip a second time to clear it — the stale
  timer could fire afterwards with its old closed-over `category` value and overwrite the URL the
  user had just navigated to. Reproduced via `npx playwright test e2e/feed.spec.ts --repeat-each=8`
  (~1 in 5–10 runs). Fixed by tracking `category` in a ref updated by its own effect, so only
  typing (the `search` state) re-arms the debounce timer; the category ref is read at fire time
  instead of being a dependency. If you touch `feed-search.tsx` again, re-run with `--repeat-each`
  a few times before trusting a green run — a single pass doesn't catch this class of bug.
- **Combined categories+results fetch, one `<Suspense key={category:search}>`:** `FeedContent`
  fetches `getCategories()` and `getFeed()` together (`Promise.all`) and renders both the chip row
  and the result grid, instead of giving categories their own (unkeyed) Suspense boundary. This
  means every category/search change re-fetches the category list too (cheap, rarely changes) in
  exchange for a simpler, single re-fetch story that exactly mirrors `/listings`'s
  `<Suspense key={status}>` pattern instead of inventing a second one. `page.tsx` itself has no
  top-level data await (only `searchParams`), so `loading.tsx` is mostly a safety net in practice —
  the real "loading" UX comes from the inner `<Suspense fallback={<FeedSkeleton />}>`.
- **Empty-state copy** (four cases, Spanish, server-rendered via `getEmptyFeedMessage` in
  `empty-feed.tsx`): category+search → "No encontramos artículos que coincidan con tu búsqueda en
  esta categoría." (BO-6's unhappy-path AC); search only → "No encontramos artículos que coincidan
  con tu búsqueda."; category only → "No hay artículos en esta categoría por ahora."; neither (feed
  genuinely empty, not reachable with the current seed) → "Aún no hay artículos publicados."
- **Search debounce:** 400ms, per the plan. Implemented as a client-only leaf (`feed-search.tsx`)
  using `useRouter().replace`; the field is uncontrolled-feeling but kept as local `useState` since
  the UI must react to every keystroke (desired exception to "uncontrolled by default" in
  forms-and-errors.md — that rule is about forms with a submit step, not live-filtering).
- **Category chip toggle semantics** verified live against the real backend (BO-6's happy path +
  deselect) and via `e2e/feed.spec.ts`: selecting the active category chip again links back to
  `/feed` (or `/feed?search=...` if a search is active), clearing only the category.
- Grid card design (`FeedItemCard`) has no category/condition/trust badges: the contract's
  `Listing` item doesn't carry condition or trust-score fields yet (those are presumably later
  Epic 1 sub-issues), so the card only shows photo, title and price — same information density as
  `ListingCard`, adapted to a vertical grid layout instead of a row.
- Verified manually at 1440/1024/768/375/320px (Playwright MCP, real backend) and via
  `e2e/feed.spec.ts`'s 320px no-horizontal-scroll test; no issues found.
- `e2e/feed.spec.ts` ran successfully against ReNest-Backend's real Docker stack (both `desktop`
  and `mobile` projects, `npx playwright test` full suite green). One pre-existing flake unrelated
  to this change surfaced once under `--repeat-each=3`
  (`app-shell.spec.ts`'s tab-navigation test) and didn't reproduce when that file was re-run in
  isolation — not something this slice touched or introduced.

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
