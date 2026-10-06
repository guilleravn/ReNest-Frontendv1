# Architecture

## Stack

Living section: update it in the same commit that installs or removes a dependency. Versions
come from `package.json`/`node_modules`, not from memory. Runtime: Node 24, npm.

| Area            | Choice                                                                     | Version        |
| --------------- | -------------------------------------------------------------------------- | -------------- |
| Framework       | Next.js (App Router, `src/` dir)                                           | 16.3.8         |
| UI              | React                                                                      | 19.2.8         |
| Language        | TypeScript (strict)                                                        | 5.9.3          |
| Styling         | Tailwind CSS (+ CSS Modules when needed), light/dark tokens (dark default) | 4.3.3          |
| Client data     | TanStack Query (+ devtools)                                                | 5.104.1        |
| Validation      | zod (env + API responses)                                                  | 4.6.5          |
| Server boundary | `server-only`                                                              | 0.0.1          |
| Unit/component  | Vitest + Testing Library + jsdom                                           | 5.0.3          |
| E2E             | Playwright (Chromium)                                                      | 1.63.0         |
| Lint / format   | ESLint (`eslint-config-next`) + Prettier (Tailwind plugin)                 | 9.39.5 / 3.9.9 |
| Global state    | **None**: deliberately deferred, see components-and-state.md               | —              |
| Auth library    | **None**: own JWT in an httpOnly cookie (login + sign-up), see Auth below  | —              |

Next.js 16 has breaking changes vs. older versions (e.g. `middleware.ts` is now `proxy.ts`,
`cookies()`/`headers()` are async). Check `node_modules/next/dist/docs/` before writing
framework code.

## Connection to ReNest-Backend

```
Browser ──(cookies)──► Next.js server (:3001) ──(Authorization: Bearer <jwt>)──► ReNest-Backend (:3000)
```

- **Backend:** ReNest-Backend, our own REST API in a separate repo (`../ReNest-Backend`), being
  built in parallel. There is no OpenAPI spec: the agreed endpoints are in the table below.
  Document each new endpoint there as it's agreed; don't invent them.
- **Base URL:** `API_URL` (server-only), `http://localhost:3000` in development.
- **Client:** `apiFetch` in [src/lib/api/server.ts](../src/lib/api/server.ts). It runs only on the
  server, sends JSON, attaches the Bearer token, throws `ApiError` (status + body) on non-2xx, and
  validates every response with its required zod `schema`. A 401 on an authenticated call
  redirects to `/api/auth/expired` (see Auth); that `redirect()` throws, so callers that wrap
  `apiFetch` in `try/catch` must re-throw it with `unstable_rethrow`. Route Handlers serving
  client queries will need to answer a 401 themselves instead (pass `onUnauthorized: "throw"`).
- **Errors:** Nest's standard body, `{ statusCode, message, error }` (`message` is a `string[]`
  for validation errors). The UI never shows it: actions map statuses to Spanish copy.
- **Running a real backend locally:** `npm run dev` alone has nothing on `:3000`. For a real
  backend (needed for e2e tests that exercise actual flows, not mocks), go to `../ReNest-Backend`
  and run `npm run docker:up` — it builds and starts Postgres + the API in Docker on `:3000`. Stop
  it with `npm run docker:down`. See that repo's
  `docs/architecture.md#running-the-api-in-docker`.

### Auth

Own JWT (story A9 · Auth): email + password login and sign-up. No password reset, social login,
phone/identity verification or refresh tokens. Backend side and rejected alternatives:
ReNest-Backend `docs/rules/security.md` (Auth design). Rules: INV-1 and INV-5 in
[frontend-invariants.md](rules/frontend-invariants.md).

The backend authenticates with a **JWT sent as `Authorization: Bearer <token>`**. The frontend
never exposes that token to browser JS:

1. **Sign in / sign up:** the forms post to Server Actions (`features/auth/actions.ts`), which
   validate with zod, call `POST /auth/login` or `POST /auth/register`, receive
   `{ accessToken, expiresAt }` and store the token with `setSessionCookie()` in the
   `renest_token` cookie: `httpOnly`, `secure` in production, `sameSite: "lax"`, `path: "/"`,
   `expires` = `expiresAt` (~7 days, so the session survives closing the browser). Login then
   redirects to `safeRedirectPath(next)` (internal paths only, default `/feed`); sign-up always
   redirects to `/feed` with a one-time welcome toast (see "Flash messages").
2. **Session:** [src/lib/auth/session.ts](../src/lib/auth/session.ts) is the only entry point.
   `getSession()` (memoized per request with React `cache()`) returns the user from
   `GET /auth/me`, or `null` with no cookie (no backend call) or on a 401. `requireSession()`,
   used by the `(tabs)` and `(detail)` layouts, redirects to `/api/auth/expired` when it's
   `null`.
3. **Authenticated calls:** `apiFetch` reads the cookie only to add the Bearer header.
4. **Expired or rejected token:** Server Components can't delete cookies, so they redirect to the
   Route Handler `GET /api/auth/expired`, which clears the cookie and redirects to `/login`.
5. **Logout:** `logoutAction` (account menu in the header) deletes the cookie and redirects to
   `/login`. There is no backend logout endpoint (tokens are not revoked in the MVP).
6. **Route protection:** [src/proxy.ts](../src/proxy.ts) (Next 16's replacement for
   `middleware.ts`) redirects by the cookie's **presence** only, via the pure
   `getRouteRedirect()` (`lib/auth/route-access.ts`): no cookie on a protected route →
   `/login?next=<path+search>`; a cookie on `/login` or `/register` → `/feed`. Its matcher skips
   `_next`, static files, `/brand`, the favicon and `/api/auth/expired`. Real authorization is
   always enforced by the backend.
7. **Swappable boundary:** pages, layouts and actions get the session only through
   `lib/auth/session.ts`, so changing the auth provider later stays contained.

#### Flash messages

A one-time message across a redirect (today only "¡Cuenta creada! Bienvenido, {fullName}" after
sign-up). `setFlash()` ([src/lib/flash/flash.ts](../src/lib/flash/flash.ts)) stores it in the
httpOnly `renest_flash` cookie (60 s). The `(tabs)` layout reads it with `readFlash()` and renders
`FlashToast`, which shows it in a `Toast` and, once mounted, calls `clearFlashAction` to delete
the cookie (Server Components can't). That action refreshes the route, so the toast keeps the
message in local state.

### Endpoints

| Method | Path             | Auth   | Request                                                                                                  | Response schema (frontend)                                                 | Used by                                |
| ------ | ---------------- | ------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------- |
| POST   | `/auth/login`    | Public | `{ email, password }`                                                                                    | `authTokenSchema` `{ accessToken, expiresAt }`                             | `loginAction`                          |
| POST   | `/auth/register` | Public | `{ fullName, email, city, phoneE164: string \| null, password, acceptedTerms: true }` (`registerSchema`) | `authTokenSchema` (signs the user in)                                      | `registerAction`                       |
| GET    | `/auth/me`       | Bearer | —                                                                                                        | `sessionUserSchema` `{ id, email, fullName, city, phoneE164, isVerified }` | `getSession()` (layouts, account menu) |

Statuses the UI handles (everything else → "No pudimos conectar con ReNest. Intenta de nuevo."):

- `POST /auth/login`: 401 for an unknown email **and** a wrong password (same message, "Correo o
  contraseña incorrectos"); 429 rate limit.
- `POST /auth/register`: 409 email already registered (shown on the email field); 429.
- `GET /auth/me`: 401 → signed out. Any other failure is thrown to `src/app/error.tsx` (see
  "Error boundary"). `id` is a UUID (UUIDv7 on the backend).
- `expiresAt` is ISO 8601 UTC. `city` is one of `USER_ZONES` (`features/auth/schemas.ts`, exact
  strings, also the `<select>` labels). The backend strips spaces, hyphens, dots and parentheses
  from the phone and then requires `^\+[1-9]\d{7,14}$`; `registerSchema` does the same, and sends
  an empty phone as `null`.

### Error boundary

[src/app/error.tsx](../src/app/error.tsx) is the app-wide boundary. An `error.tsx` wraps the
layouts nested below its segment, but not the layout of its own segment, so the root-level one
catches errors from the `(tabs)`/`(detail)`/`(auth)` layouts and every page (e.g. `GET /auth/me`
down). It shows "Algo salió mal" in `role="alert"` with a "Reintentar" button (`retry()`
re-fetches the segment) and never the raw error. Errors in the root layout itself aren't covered
(that needs `global-error.tsx`, not added). Segments can add closer `error.tsx` files as data
views arrive.

## Providers and layouts

```
src/app/layout.tsx            Server Component: <html>, fonts (Geist), globals.css, metadata
└─ <Providers>                src/app/providers.tsx ("use client")
   └─ QueryClientProvider     TanStack Query; client from src/lib/query-client.ts
      ├─ {children}           Route pages
      └─ ReactQueryDevtools   Dev-only panel (excluded from production builds)
```

`getQueryClient()` creates a new `QueryClient` per request on the server and reuses a single one
in the browser.

## Routes

Paths mirror the reference app. Pages are placeholders (heading only) until their epic is built.
**Auth:** every route requires a session except `/login` and `/register` (enforced optimistically
by `src/proxy.ts`, and by `requireSession()` in the `(tabs)`/`(detail)` layouts).

| Route                           | Shell         | Auth   | Back link (phone) | Description                                                            |
| ------------------------------- | ------------- | ------ | ----------------- | ---------------------------------------------------------------------- |
| `/`                             | none          | Yes    | —                 | Redirects to `/feed`                                                   |
| `/feed`                         | `(tabs)`      | Yes    | —                 | Feed (Epic 1)                                                          |
| `/items/[itemId]`               | `(detail)`    | Yes    | `/feed`           | Item detail (Epic 1)                                                   |
| `/items/[itemId]/contact`       | `(detail)`    | Yes    | `/items/[itemId]` | Question to seller (Epic 1)                                            |
| `/items/[itemId]/pickup`        | `(detail)`    | Yes    | `/items/[itemId]` | Schedule pickup (Epic 2)                                               |
| `/purchases`                    | `(detail)`    | Yes    | `/feed`           | My purchases (Epic 3); tab in `?status=` (`completed`, else scheduled) |
| `/purchases/[purchaseId]/recap` | `(detail)`    | Yes    | `/purchases`      | Purchase recap (Epic 3)                                                |
| `/listings`                     | `(tabs)`      | Yes    | —                 | My listings (Epic 5)                                                   |
| `/listings/new`                 | `(tabs)`      | Yes    | —                 | Create a listing (Epic 4)                                              |
| `/listings/[listingId]`         | `(tabs)`      | Yes    | —                 | Seller's listing (Epic 5)                                              |
| `/login`                        | `(auth)`      | Public | —                 | Login (A9); `?next=` = where to go after signing in                    |
| `/register`                     | `(auth)`      | Public | —                 | Sign-up (A9); always lands on `/feed`                                  |
| `/api/auth/expired`             | Route Handler | —      | —                 | Clears a stale session cookie, redirects to `/login`                   |

### App shell

Route groups in `src/app/` pick the shell; components live in `src/components/layout/`.

- `(tabs)`: `AppHeader` + `TabNav` (Inicio / Mis artículos). Desktop shows a segmented bar under
  the header; below `sm` it becomes a bottom bar fixed to the viewport, so `main` gets extra
  bottom padding there. Also renders `FlashToast`.
- `(detail)`: `AppHeader isDetail`, which adds a bottom border and a phone-only back link. Its
  target comes from `getBackHref(pathname)` (`back-href.ts`); add new detail routes there.
- `(auth)`: no app shell; a centered column with the logo and the page's card.

Both app shells call `requireSession()` and pass the account menu to `AppHeader` through its
`accountMenu` slot: `AccountMenu` (`features/auth/components/`) shows the user's initial, opens a
disclosure with their name and email, and holds "Cerrar sesión". The slot keeps
`components/layout` free of auth code.

The nav badges are **real data, never hardcoded**: `AppHeader` takes `scheduledPurchasesCount`,
`TabNav` takes `listingsInProgressCount`. Each is optional, and an undefined or zero count shows
no badge. The layouts don't pass them yet because there are no endpoints. Open question for the
backend: where those two counts come from (a dedicated summary endpoint or counts on the list
endpoints).

## Environment variables

Defined in `.env.local` (git-ignored); every variable is documented in `.env.example`.

| Variable  | Scope       | Example                 | Purpose                 |
| --------- | ----------- | ----------------------- | ----------------------- |
| `API_URL` | Server-only | `http://localhost:3000` | ReNest-Backend base URL |

Auth needs no variables of its own: the JWT is signed and verified by the backend.

There are no `NEXT_PUBLIC_*` variables yet. Add one only for a value the browser truly needs, and
never for secrets. Server-only variables are validated in [src/lib/env.ts](../src/lib/env.ts);
add new ones to its zod schema.

## Known issues

- `npm audit` reports 5 high-severity advisories in `braces`, pulled in through
  `eslint-config-next` (dev/lint only, not shipped to users). `npm audit fix --force` would
  downgrade to `eslint-config-next@14`, so it's left as is until upstream updates.

## Known deviations from the conventions

State as of 2026-10-06. Not rewritten up front; fix them in the slice that touches that code.

- `src/app/providers.tsx` types its props inline (`{ children: ReactNode }`) instead of
  `type ProvidersProps`. Acceptable for a single prop; follow the convention in new components.
- Commit history: `docs: …` and `chore: …` without a scope. Valid because they are repo-wide
  changes; feature commits do carry a scope.
