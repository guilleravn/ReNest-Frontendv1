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
| Auth library    | **None**: own JWT in an httpOnly cookie (login only), see Auth below       | —              |

Next.js 16 has breaking changes vs. older versions (e.g. `middleware.ts` is now `proxy.ts`,
`cookies()`/`headers()` are async). Check `node_modules/next/dist/docs/` before writing
framework code.

## Connection to ReNest-Backend

```
Browser ──(cookies)──► Next.js server (:3001) ──(Authorization: Bearer <jwt>)──► ReNest-Backend (:3000)
```

- **Backend:** ReNest-Backend, our own REST API in a separate repo (`../ReNest-Backend`), being
  built in parallel. **No API contract exists yet**: no OpenAPI spec and no agreed endpoints.
  Document each endpoint below as it's agreed; don't invent them.
- **Base URL:** `API_URL` (server-only), `http://localhost:3000` in development.
- **Client:** `apiFetch` in [src/lib/api/server.ts](../src/lib/api/server.ts). It runs only on the
  server, sends JSON, attaches the Bearer token, throws `ApiError` (status + body) on non-2xx, and
  validates responses with zod.
- **Running a real backend locally:** `npm run dev` alone has nothing on `:3000`. For a real
  backend (needed for e2e tests that exercise actual flows, not mocks), go to `../ReNest-Backend`
  and run `npm run docker:up` — it builds and starts Postgres + the API in Docker on `:3000`. Stop
  it with `npm run docker:down`. See that repo's
  `docs/architecture.md#running-the-api-in-docker`.

### Auth (agreed design, not implemented yet)

Minimal own JWT, agreed by the team (story A9 · Log in with email and password). **Login only**
for seeded accounts: no sign-up, password reset, refresh tokens or fake "current user" switch.
Backend side and rejected alternatives: ReNest-Backend `docs/rules/security.md` (Auth design).

The backend authenticates with a **JWT sent as `Authorization: Bearer <token>`**. The frontend
never exposes that token to browser JS:

1. **Login:** the form posts to a Server Action, which calls `POST /auth/login`, receives
   `{ accessToken }` and stores it in the `renest_token` cookie: `httpOnly`, `secure` in
   production, `sameSite: "lax"`, `path: "/"`, with `maxAge` matching the token expiry (~7 days,
   so the session survives closing the browser).
2. **Authenticated calls:** `apiFetch` reads the cookie and adds the Bearer header. The current
   user comes from `GET /auth/me`.
3. **Logout:** a Server Action deletes the cookie. There is no backend logout endpoint (tokens
   are not revoked in the MVP).
4. **Route protection:** `src/proxy.ts` (Next 16's replacement for `middleware.ts`) does
   optimistic redirects based on the cookie's presence. Real authorization is always enforced by
   the backend; a 401 from `apiFetch` clears the session and redirects to login.
5. **Swappable boundary:** pages and components get the session only through one server-side
   module (e.g. `getSession()`), never by reading the cookie themselves, so changing the auth
   provider later (planned with sign-up in R2) stays contained.

`POST /auth/login` and `GET /auth/me` are a **proposed** contract: confirm the payloads in the
plan of the login story and then record them in the Endpoints table below.

### Endpoints

_None agreed yet._ Format when adding:

| Method | Path | Auth | Request | Response schema (frontend) | Used by |
| ------ | ---- | ---- | ------- | -------------------------- | ------- |

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

Paths mirror the reference app. Every page below is a placeholder (heading only) until its
epic is built. Auth is "No" everywhere until the login flow and `src/proxy.ts` exist.

| Route                           | Shell           | Back link (phone) | Description                                                            |
| ------------------------------- | --------------- | ----------------- | ---------------------------------------------------------------------- |
| `/`                             | none            | —                 | Redirects to `/feed`                                                   |
| `/feed`                         | `(tabs)`        | —                 | Feed (Epic 1)                                                          |
| `/items/[itemId]`               | `(detail)`      | `/feed`           | Item detail (Epic 1)                                                   |
| `/items/[itemId]/contact`       | `(detail)`      | `/items/[itemId]` | Question to seller (Epic 1)                                            |
| `/items/[itemId]/pickup`        | `(detail)`      | `/items/[itemId]` | Schedule pickup (Epic 2)                                               |
| `/purchases`                    | `(detail)`      | `/feed`           | My purchases (Epic 3); tab in `?status=` (`completed`, else scheduled) |
| `/purchases/[purchaseId]/recap` | `(detail)`      | `/purchases`      | Purchase recap (Epic 3)                                                |
| `/listings`                     | `(tabs)`        | —                 | My listings (Epic 5)                                                   |
| `/listings/new`                 | `(tabs)`        | —                 | Create a listing (Epic 4)                                              |
| `/listings/[listingId]`         | `(tabs)`        | —                 | Seller's listing (Epic 5)                                              |
| `/login`                        | none (`(auth)`) | —                 | Login (Epic 6)                                                         |

### App shell

Route groups in `src/app/` pick the shell; components live in `src/components/layout/`.

- `(tabs)`: `AppHeader` + `TabNav` (Inicio / Mis artículos). Desktop shows a segmented bar under
  the header; below `sm` it becomes a bottom bar fixed to the viewport, so `main` gets extra
  bottom padding there.
- `(detail)`: `AppHeader isDetail`, which adds a bottom border and a phone-only back link. Its
  target comes from `getBackHref(pathname)` (`back-href.ts`); add new detail routes there.
- `(auth)`: no shell.

The nav badges and the avatar initial are **real data, never hardcoded**: `AppHeader` takes
`scheduledPurchasesCount` and `userInitial`, `TabNav` takes `listingsInProgressCount`. Each is
optional, and an undefined or zero count shows no badge. The layouts don't pass them yet because
there are no endpoints. Open questions for the backend: where those two counts come from (a
dedicated summary endpoint or counts on the list endpoints), and the current-user endpoint for
the initial.

## Environment variables

Defined in `.env.local` (git-ignored); every variable is documented in `.env.example`.

| Variable  | Scope       | Example                 | Purpose                 |
| --------- | ----------- | ----------------------- | ----------------------- |
| `API_URL` | Server-only | `http://localhost:3000` | ReNest-Backend base URL |

There are no `NEXT_PUBLIC_*` variables yet. Add one only for a value the browser truly needs, and
never for secrets. Server-only variables are validated in [src/lib/env.ts](../src/lib/env.ts);
add new ones to its zod schema.

## Known issues

- `npm audit` reports 5 high-severity advisories in `braces`, pulled in through
  `eslint-config-next` (dev/lint only, not shipped to users). `npm audit fix --force` would
  downgrade to `eslint-config-next@14`, so it's left as is until upstream updates.

## Known deviations from the conventions

State as of 2026-10-05. Not rewritten up front; fix them in the slice that touches that code.

- `src/lib/api/server.ts`: `schema` is optional in `ApiFetchOptions` and there is a
  `(data as T)` cast when it's missing, while INV-2 requires a `schema` on every call. Consider
  making it mandatory (or adding an explicit variant for responses without a body).
- `src/app/providers.tsx` types its props inline (`{ children: ReactNode }`) instead of
  `type ProvidersProps`. Acceptable for a single prop; follow the convention in new components.
- Commit history: `docs: …` and `chore: …` without a scope. Valid because they are repo-wide
  changes; feature commits do carry a scope.
