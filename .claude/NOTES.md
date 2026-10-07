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

## 2026-10-07 · A9 / BO-39 (merge of develop with BO-27/BO-40/BO-41) · main session

- Merged `origin/develop` (My Listings) into `feat/a9-auth` instead of rebasing: the branch was
  already pushed. The endpoints table now holds both the auth endpoints and `GET /listings`
  (Auth: Bearer — the backend's BO-40 stub is gone, the route needs a token).
- `listing-card.tsx` imported icons from `components/layout/icons`, which A9 moved to
  `components/ui/icons`; repointed.
- `/listings` is protected now, so `e2e/listings.spec.ts` runs signed in as the seeded seller
  Samuel (his fixed listings, one per status). The `setup` Playwright project signs in **once per
  run** (`e2e/seeded-seller.setup.ts` → `playwright/.auth/seeded-seller.json`, gitignored):
  signing in per worker tripped the backend's 5 attempts / 60 s per IP + email limit. The suite
  needs `E2E_SEED_PASSWORD` (= ReNest-Backend's `SEED_USER_PASSWORD`).
- Verified: lint, typecheck, format, 219 unit tests, build, and the full e2e suite (87/87,
  desktop + mobile) against a fresh `next start` and the Docker backend.

## 2026-10-06 · BO-39 (QA changes requested) · frontend-issue-implementer

- `isSafeRedirectPath` checks `/api` on the WHATWG-resolved pathname (and its percent-decoded
  form), so `/./api`, `/feed/../api` and `/%2e/api` are rejected. It still **returns the
  original path**, not the normalized one: `/..//evil.com` resolves on our host as given, but
  its normalized form `//evil.com` would be protocol-relative (another host).
- E2E accounts: `e2e/fixtures.ts` adds a worker-scoped `workerAccount` (signed up once through
  the UI; `storageState` saved under the project's output dir without the flash cookie) and
  `signedInTest`. Moved to it: all of `app-shell.spec.ts`, and in auth/auth-session the reload,
  logout, cookie-removal, client-navigation, expired-handler CSRF and account-menu tests; the
  duplicate-email test reuses the worker account's email. Login tests still sign up their own
  fresh account, because logging in repeatedly as the shared email within one worker would hit
  the per-IP+email limit (5 / 60 s). The fixture's callback is named `provide` because
  `react-hooks/rules-of-hooks` flags a function called `use`.
- QA's "never sends the password back" test failed deterministically against a production
  build (`next start`): after the action response, Next prefetches the page's links and
  Chromium discards the earlier POST body, so `response.text()` read later throws. The helper
  now reads the body as soon as the response arrives; the assertion is unchanged. There is no
  navigation (checked).
- Targeted run against `next start -p 3002` + a contract mock on :3999 (nothing on :3000): 62
  tests passed in desktop and mobile after that fix. Excluded: tests that hardcode
  `localhost:3001` cookie URLs or call :3000 directly, and the rate-limit test.

## 2026-10-06 · BO-39 (A9 review fixes) · frontend-qa-reviewer

- **E2E against the real backend** (credential limits raised to 1000 in Docker, per IP+email
  still 5): 78/78 in `desktop` + `mobile` against a fresh `next build && next start`. Against
  the long-running dev server on :3001, `app-shell` "detail pages go back to their parent"
  failed in both projects because that server answered every dynamic route (`/items/[itemId]…`)
  with a 500 "Jest worker encountered 2 child process exceptions". That is a crashed dev-server
  worker, not this code. Restart `npm run dev` if you see it.
- `e2e/fixtures.ts` keeps the worker account's storage state in memory. A file under
  `test-results/` disappeared mid-run (the dir is shared and cleaned by other Playwright runs).
- The "never sends the password back" e2e now reads the action's response through `page.route`.
  Chromium could still discard the body before `response.text()` ran, even when reading it
  right away. It also asserts that the body holds the action state, so an empty body can't pass.

## 2026-10-06 · BO-39 (A9 review fixes) · frontend-issue-implementer

- **Logout CSRF (#7b), different rule than suggested:** `/api/auth/expired` doesn't check
  `Sec-Fetch-Site`/`Origin`. It re-checks the token with `GET /auth/me` and clears the cookie
  only on a 401; a valid session just continues to `next`. A same-origin rule would loop: a
  link from an email to `/purchases` with a stale cookie is a cross-site redirect chain, and
  not clearing there bounces `/login` → (proxy) `/feed` → expired → `/login` forever. If the
  backend is unreachable, the cookie is kept and the user continues to `next` (error boundary).
- **Current page on the server (#8):** `src/proxy.ts` sets the `x-renest-page-path` request
  header (`NextResponse.next({ request: { headers } })`, always overwriting a client value,
  `_rsc` stripped). It's the only reliable way: Server Components can't read the URL, and the
  header is present for full loads, client navigations and Server Action posts. Every use goes
  through `withNextParam`/`safeRedirectPath`. `getRouteRedirect` now takes `{ pagePath }`, so
  the login `next` from the proxy also drops `_rsc`.
- **Client IP (#4):** self-hosted Next keeps any client-sent `X-Forwarded-For` (it only fills
  it in when missing, `base-server.js`), so `getClientIp` takes the **rightmost** entry and
  forwards that single IP. It's only correct behind exactly one trusted proxy that sets or
  appends the header (Vercel, nginx); documented in architecture.md "Client IP". Needs revisiting
  if the deployment has more hops.
- **Zones (#3):** not cached (`cache: "no-store"`): one small request per `/register` visit,
  a stale copy could offer a zone the backend rejects, and a Data Cache key would vary with the
  forwarded IP anyway. A 400 whose Nest message starts with `city ` maps to the zone field;
  that relies on class-validator's message format (other 400s → "Revisa los datos e intenta de
  nuevo.").
- **Over-length login password** (> 128, only by bypassing `maxLength`) reuses "Revisa los datos
  e intenta de nuevo." as its field error: no new copy.
- `components/ui/checkbox.tsx` was removed (`git rm`, staged) since nothing uses it any more.
- E2E selects zones by option index (they come from the backend now). Updated expectations:
  stale-session redirects now end on `/login?next=<page>`. Added: stale cookie on `/purchases` →
  login → back on `/purchases`; a valid session hitting `/api/auth/expired` keeps its cookie;
  `next=/api/...` is ignored. **Not run** in this round (backend changes in progress).
- **E2E is not in CI** (#11): run `npm run test:e2e` locally against `npm run docker:up` before
  merging until CI e2e is reinstated (also in testing.md).

## 2026-10-06 · A9 (auth) · frontend-qa-reviewer

- **E2E verified against the real backend** (ReNest-Backend `feat/a9-auth` in Docker): all specs
  pass in `desktop` and `mobile`. `e2e/auth-session.spec.ts` adds cookie attributes, INV-1
  (token absent from `document.cookie`, HTML and action responses), stale cookie without
  redirect loops (full load and client navigation), open-redirect attempts (query and tampered
  hidden field), the real 429 (6 attempts on one email), sign-up field errors and focus, and the
  account menu keyboard flow. The 429 test relies on the backend's per-email login throttle.
- **Open, low priority** (not blocking A9):
  - A login password over 128 chars gets a backend 400, shown as "No pudimos conectar con
    ReNest…" instead of the credentials error: the login password input has no `maxLength` and
    `loginSchema` no max.
  - `next=/api/auth/expired` passes `safeRedirectPath`, so a crafted login link signs the user
    out right after signing in (annoyance, not a leak). `/api/auth/expired` is also a plain GET,
    so a cross-site link can sign a user out (logout CSRF, common and low impact).
  - The account menu truncates long names/emails with no way to read the full text.

## 2026-10-06 · A9 (auth) · frontend-issue-implementer

- **Flash toast mechanism:** `lib/flash/flash.ts` has `setFlash`/`readFlash`/`clearFlash`
  (`readFlash` instead of the brief's `consumeFlash`, because a Server Component can only read).
  The `(tabs)` layout passes `readFlash()` to the client `FlashToast`, which on mount calls
  `clearFlashAction` (Server Action, `startTransition`) and keeps the text in local state. I
  chose a Server Action over a Route Handler + `fetch` because mutating cookies in an action
  refreshes the route, which also replaces the client router cache entry that still holds the
  flash (with a plain `fetch`, Back could replay the toast). The message is put into the
  live region one tick after mount, so screen readers announce it. The cookie stores the final
  text (≤ 200 chars, zod-checked on read), so `lib/flash` has no auth copy.
- **Account menu via a slot, not `userInitial`:** `AppHeader` lost `userInitial` and gained an
  `accountMenu` slot. The layouts compose `<AccountMenu fullName email />`
  (`features/auth/components/`), which derives the initial itself. That keeps
  `components/layout` free of auth/feature imports. Opening focuses "Cerrar sesión"; Escape
  closes and refocuses the avatar; a pointer-down outside closes. Tabbing out doesn't close it
  (disclosure pattern).
- **Icons moved:** `components/layout/icons.tsx` → `components/ui/icons.tsx` (`git mv`, staged),
  since feature and `ui` components now need icons too. Added shield-check, circle-check,
  chevron-down, x and log-out (Lucide).
- **`<select>` keeps its value through a Server Action reset:** React applies a select's
  `defaultValue` only on mount, and React resets action forms after every submit, so the zone
  snapped back to "Elige tu zona" after a failed submit. `SelectField` keys the `<select>` by its
  `defaultValue` (remounts when it changes). Text inputs and the checkbox don't need this.
- **No invented copy for over-length values:** name/email/password over the backend maxima
  reuse the brief's messages ("Ingresa tu nombre", "Correo no válido", "La contraseña debe tener
  al menos 8 caracteres"), and the inputs set `maxLength` so the UI can't get there.
- **Error mapping:** any status other than 401/409/429 (5xx, and a 400 the mirrored validation
  should prevent) and network failures show "No pudimos conectar con ReNest. Intenta de nuevo.".
  A response that breaks the zod contract is re-thrown (fails loudly, INV-2). If `/auth/me`
  is down, the protected layouts throw to `src/app/error.tsx` (see below).
- **Forms use `noValidate`** (with `required` kept for assistive tech) so the browser's native
  bubbles don't pre-empt the Spanish server-side messages. After a submit with field errors,
  focus moves to the first invalid field (`useFocusFirstInvalidField`).
- **`next` handling:** `safeRedirectPath` also rejects control characters/whitespace (browsers
  strip tabs/newlines, turning `/\t/evil.com` into `//evil.com`). The proxy omits `next` for `/`.
  The login ↔ register links carry a safe `next` both ways, but sign-up always lands on `/feed`
  (per the brief, and the toast lives in `(tabs)`).
- **`apiFetch`:** `schema` is now required (known deviation fixed, removed from
  architecture.md). New option `onUnauthorized: "redirect" | "throw"` (default redirect to
  `/api/auth/expired`); `getCurrentUser` uses `"throw"` so `getSession()` can return `null`.
  `AUTH_COOKIE` moved to `lib/auth/constants.ts` (no `server-only`) so `proxy.ts` can import it;
  `apiFetch` still reads the cookie for the Bearer header (importing `session.ts` would create a
  cycle through `features/auth/api.ts`).
- **E2E:** `app-shell.spec.ts` now signs up in `beforeEach` (every shell route is protected) and
  clears cookies for the login-page test; shared helpers in `e2e/helpers/auth.ts`. Specs create
  a fresh account per test, so they need no seed. Not run against the real backend (not ready):
  all 30 (desktop + mobile) passed against a throwaway local mock of the agreed contract that
  lives outside the repo. Rerun with `npm run docker:up` in ReNest-Backend once it exists.
- **Decided by the coordinator after the first pass:** `GET /auth/me` `id` is a UUID (the backend
  uses UUIDv7), so the schema uses `z.uuid()`. A9 also adds `src/app/error.tsx`, because the
  protected layouts now call `/auth/me` on every render. It sits at the root segment because
  `error.tsx` wraps the nested layouts below it but not the layout of its own segment, so it
  catches errors thrown in `(tabs)/layout.tsx` and `(detail)/layout.tsx`. It uses Next 16's
  `retry()` (re-fetches) rather than `reset()`, and never shows `error.message`. Errors in the
  root layout itself would need a `global-error.tsx`, which isn't added.

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
