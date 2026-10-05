# Testing

## Runners

| Layer            | Tool                                    | Command            | Location                            |
| ---------------- | --------------------------------------- | ------------------ | ----------------------------------- |
| Unit / component | Vitest + Testing Library (jsdom)        | `npm test`         | `src/**/*.test.{ts,tsx}`, colocated |
| End-to-end       | Playwright (Chromium, desktop + mobile) | `npm run test:e2e` | `e2e/*.spec.ts`                     |

- `npm run test:watch` runs Vitest in watch mode.
- Vitest setup (jest-dom matchers, cleanup) lives in `src/test/setup.ts`; config in
  `vitest.config.mts`.
- Playwright starts `npm run dev` on port 3001 automatically (or reuses a running one). First
  time on a new machine: `npx playwright install chromium`.
- The `pre-commit` hook runs `npm test` but not e2e: run `npm run test:e2e` before committing
  user flows.
- Every spec runs in two Playwright projects: `desktop` (Desktop Chrome, 1280×720) and `mobile`
  (Pixel 7, Chromium). Write specs that pass in both. When a flow differs on small screens (e.g.
  the nav lives behind a menu button), branch on `test.info().project.name`. Use
  `--project=desktop` to run just one.

## Limits to know

- Vitest **cannot render `async` Server Components**. Test their logic by extracting pure
  functions, and cover the rendered page with Playwright.
- Modules that `import "server-only"` won't load in Vitest's jsdom environment. Keep the logic you
  want to unit test in plain modules, and keep `server-only` files thin.
- E2E tests run against the real dev server, which talks to ReNest-Backend. Prefer a **real
  backend over mocks**: in `../ReNest-Backend`, run `npm run docker:up` to start Postgres + the API
  in Docker on `:3000` (matches `API_URL` in `.env.example`). Fall back to mocking (`page.route`)
  only for flows that need backend state Docker can't easily provide yet (e.g. a specific error
  response), or while the endpoint the flow needs doesn't exist yet. See
  [architecture.md](../architecture.md#connection-to-renest-backend).

## What to test first

Prioritize **critical user flows**, not coverage numbers:

1. E2E for each critical flow as it's built (login/logout, the main create/edit flows).
2. Component tests for interactive client components with real logic (forms, validation
   messages, conditional UI).
3. Unit tests for zod schemas (one valid case and the relevant invalid ones) and data
   transformations.

Skip tests for purely presentational markup with no logic.

## Writing tests

- ✅ Vitest (`vi.*`). `describe` = unit under test, `it` = observable behavior, in English and
  present tense: `it("shows an error when the email is invalid")`. ❌ `it("works")`.
- ✅ Arrange / Act / Assert separated by blank lines.
- ✅ Query like a user, by priority: `getByRole` (with `name`) → `getByLabelText` → `getByText` →
  `getByTestId` only when there is no accessible alternative. Always via `screen`. ❌
  `container.querySelector` by habit.
- ✅ `getBy*` to assert presence; `queryBy*` + `.not.toBeInTheDocument()` for absence;
  `await findBy*` for things that appear asynchronously. ❌ `waitFor` with side effects inside;
  ❌ `findBy` "just in case".
- ✅ `const user = userEvent.setup()` before `render`, then `await user.click(...)`/`type(...)`.
  ❌ `fireEvent` except for events user-event does not model.
- ✅ jest-dom matchers (`toBeDisabled`, `toHaveAccessibleName`, `toHaveAttribute`).
- ✅ Mock only the edges (network, `next/navigation`, imported Server Actions, the clock). ❌
  mocking your own logic or child components. Use `mockResolvedValueOnce` and restore
  (`vi.restoreAllMocks()` / `vi.useRealTimers()` in `afterEach`).
- ✅ Test behavior, not implementation: ❌ asserting internal state, CSS classes or render
  counts.
- ✅ Re-render with `rerender`, not a second `render`. Hooks with `renderHook` from
  `@testing-library/react`.
- ✅ Playwright: `page.getByRole`/`getByLabel`, `await expect(...).toBeVisible()` (auto-wait);
  ❌ `page.waitForTimeout`, brittle CSS selectors.

```tsx
it("disables submit while the form is pending", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/email/i), "ada@example.com");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
});
```
