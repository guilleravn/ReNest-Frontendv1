# Architecture

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

### Auth (planned design, not implemented yet)

The backend authenticates with a **JWT sent as `Authorization: Bearer <token>`**. The frontend
never exposes that token to browser JS:

1. **Login:** the form posts to a Server Action, which calls the backend login endpoint (TBD),
   receives the JWT and stores it in the `renest_token` cookie: `httpOnly`, `secure` in
   production, `sameSite: "lax"`, `path: "/"`, with `maxAge` matching the token expiry.
2. **Authenticated calls:** `apiFetch` reads the cookie and adds the Bearer header.
3. **Logout:** a Server Action deletes the cookie (and calls a backend logout endpoint if one
   exists).
4. **Route protection:** `src/proxy.ts` (Next 16's replacement for `middleware.ts`) does
   optimistic redirects based on the cookie's presence. Real authorization is always enforced by
   the backend; a 401 from `apiFetch` clears the session and redirects to login.

Open questions for the backend: login endpoint and payload, token lifetime, refresh tokens or
not, current-user endpoint.

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

| Route | File               | Type             | Auth | Description              |
| ----- | ------------------ | ---------------- | ---- | ------------------------ |
| `/`   | `src/app/page.tsx` | Server Component | No   | Placeholder landing page |

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
