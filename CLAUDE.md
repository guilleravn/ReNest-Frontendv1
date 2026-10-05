@AGENTS.md

# ReNest Frontend

## Language

English for everything written in the repo: code, comments, docs, commit messages. (The
maintainer may talk to you in Spanish; answer in Spanish, write the repo in English.)

Exception: **user-facing UI copy is Spanish** (`<html lang="es">`), matching the mockups.

## What this is

The web frontend of ReNest, a Next.js App Router app. It consumes **ReNest-Backend**, our own
REST API that lives in a separate repository (`../ReNest-Backend`) and runs on
`http://localhost:3000` in development. This app runs on port **3001**.

The backend is being built in parallel and **has no API contract yet**. Never invent endpoints
or response shapes. When a feature needs one, ask for it, then record it in
[docs/architecture.md](docs/architecture.md).

## Stack — current state

Living section: update it in the same commit that installs or removes a dependency. Versions
come from `package.json`/`node_modules`, not from memory.

| Area            | Choice                                                                  | Version        |
| --------------- | ----------------------------------------------------------------------- | -------------- |
| Framework       | Next.js (App Router, `src/` dir)                                        | 16.3.8         |
| UI              | React                                                                   | 19.2.8         |
| Language        | TypeScript (strict)                                                     | 5.9.3          |
| Styling         | Tailwind CSS (+ CSS Modules when needed), dark-only theme tokens        | 4.3.3          |
| Icons           | lucide-react                                                            | 1.52.0         |
| Fonts           | Urbanist (body), Diphylleia (headings), JetBrains Mono, via `next/font` | —              |
| Client data     | TanStack Query (+ devtools)                                             | 5.104.1        |
| Validation      | zod (env + API responses)                                               | 4.6.5          |
| Server boundary | `server-only`                                                           | 0.0.1          |
| Unit/component  | Vitest + Testing Library + jsdom                                        | 5.0.3          |
| E2E             | Playwright (Chromium)                                                   | 1.63.0         |
| Lint / format   | ESLint (`eslint-config-next`) + Prettier (Tailwind plugin)              | 9.39.5 / 3.9.9 |
| Global state    | **None**: deliberately deferred, see coding-style.md                    | —              |
| Auth library    | **None**: custom JWT-in-httpOnly-cookie flow, see architecture          | —              |

Runtime: Node 24, npm.

Next.js 16 has breaking changes vs. older versions (e.g. `middleware.ts` is now `proxy.ts`,
`cookies()`/`headers()` are async). Check `node_modules/next/dist/docs/` before writing
framework code.

## Commands

| Command                | What it does                                 |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Dev server on http://localhost:3001          |
| `npm run build`        | Production build                             |
| `npm run start`        | Serve the production build on port 3001      |
| `npm run lint`         | ESLint                                       |
| `npm run typecheck`    | `tsc --noEmit`                               |
| `npm run format`       | Prettier write                               |
| `npm run format:check` | Prettier check                               |
| `npm test`             | Vitest, single run                           |
| `npm run test:watch`   | Vitest, watch mode                           |
| `npm run test:e2e`     | Playwright (starts the dev server if not up) |

Before proposing a commit: `lint`, `typecheck`, `format:check` and `test` must pass.

## Non-negotiable process rules

- **Plan mode first** for anything non-trivial. Present the plan and wait for approval.
- **One commit per slice.** A slice is usually one complete feature: component(s) + API call +
  types/schemas + tests. See [git-workflow.md](docs/conventions/git-workflow.md).
- **Never `git push`** unless explicitly asked to in that moment.
- **Show the full commit message in chat and wait for approval** before committing.
- **No AI attribution** in commits (no `Co-Authored-By`, no "Generated with" lines).
- **No secrets in the repo.** Tokens and private URLs live in `.env.local` (git-ignored);
  `.env.example` documents every variable with safe placeholder values. Use the `NEXT_PUBLIC_*`
  prefix only for values that truly must reach the browser; everything else stays server-only.

## Where to look

| Topic                                                      | Doc                                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| Folders, Server/Client split, data fetching, state, styles | [docs/conventions/coding-style.md](docs/conventions/coding-style.md)   |
| Test runners and what to test first                        | [docs/conventions/testing.md](docs/conventions/testing.md)             |
| Plan mode, slices, commits                                 | [docs/conventions/git-workflow.md](docs/conventions/git-workflow.md)   |
| UI/data invariants                                         | [docs/rules/frontend-invariants.md](docs/rules/frontend-invariants.md) |
| Backend connection, auth, providers, routes, env vars      | [docs/architecture.md](docs/architecture.md)                           |
