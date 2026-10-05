# Testing

## Runners

| Layer            | Tool                             | Command            | Location                            |
| ---------------- | -------------------------------- | ------------------ | ----------------------------------- |
| Unit / component | Vitest + Testing Library (jsdom) | `npm test`         | `src/**/*.test.{ts,tsx}`, colocated |
| End-to-end       | Playwright (Chromium)            | `npm run test:e2e` | `e2e/*.spec.ts`                     |

- `npm run test:watch` runs Vitest in watch mode.
- Vitest setup (jest-dom matchers, cleanup) lives in `src/test/setup.ts`; config in
  `vitest.config.mts`.
- Playwright starts `npm run dev` on port 3001 automatically (or reuses a running one). First
  time on a new machine: `npx playwright install chromium`.

## Limits to know

- Vitest **cannot render `async` Server Components**. Test their logic by extracting pure
  functions, and cover the rendered page with Playwright.
- Modules that `import "server-only"` won't load in Vitest's jsdom environment. Keep the logic you
  want to unit test in plain modules, and keep `server-only` files thin.
- E2E tests run against the real dev server, which talks to ReNest-Backend. Until the backend is
  stable, mock backend responses or keep e2e to flows that don't need it.

## What to test first

Prioritize **critical user flows**, not coverage numbers:

1. E2E for each critical flow as it's built (login/logout, the main create/edit flows).
2. Component tests for interactive client components with real logic (forms, validation
   messages, conditional UI).
3. Unit tests for zod schemas and data transformations.

Skip tests for purely presentational markup with no logic.

Query by role/label/text (`getByRole`, `getByLabelText`), as a user would; avoid test IDs unless
there is no accessible alternative.
