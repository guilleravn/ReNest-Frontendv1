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
  layer; price formatting (`Intl.NumberFormat("es-419")`, no currency code) is still an
  unconfirmed product decision; listing cards link to the still-placeholder
  `/listings/[listingId]`.
- Not addressed, flagged for awareness: no `loading.tsx`/`error.tsx` exist anywhere in the app
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
