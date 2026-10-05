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

## TBD

- Auth/route protection rules (once the login flow exists).
- Loading/error/empty-state rules for data views.
- Form validation and error-display rules.
