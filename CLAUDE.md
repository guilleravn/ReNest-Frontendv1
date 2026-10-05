@AGENTS.md

# ReNest Frontend

The web frontend of ReNest: a Next.js 16 App Router app (React 19, TypeScript strict, Tailwind 4,
TanStack Query, zod; Vitest + Playwright) on port **3001**. It consumes **ReNest-Backend**, our own
REST API in a separate repo (`../ReNest-Backend`, `http://localhost:3000` in development).

It is a **responsive web app, designed desktop-first**: every screen must also work down to
320px wide (INV-4). How to build it: [docs/conventions/styling.md](docs/conventions/styling.md).
Visual reference: [renestapp.vercel.app/feed](https://renestapp.vercel.app/feed) (palette,
typography, shape only — it isn't responsive); always style with the local design tokens in
[src/app/globals.css](src/app/globals.css), documented in styling.md. The app supports **both
light and dark themes, dark by default**; every token resolves in both, so don't build
dark-only or light-only screens.

The backend **has no API contract yet**. Never invent endpoints or response shapes: ask, then
record the contract in [docs/architecture.md](docs/architecture.md).

**Language:** English for everything written in the repo (code, comments, docs, commits). The
maintainer may talk to you in Spanish; answer in Spanish, write the repo in English.

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

`lint`, `typecheck`, `format:check` and `test` must pass before proposing a commit.

For e2e flows that need a real backend (prefer this over mocking with `page.route`), start
ReNest-Backend's Docker stack first: `cd ../ReNest-Backend && npm run docker:up` (Postgres + API on
`:3000`). Stop it with `npm run docker:down` when done.

## Process rules

Plan mode first for anything non-trivial; commits grouped by functionality/area, made directly by
QA (no approval step); no AI attribution; never `git push`; no secrets in the repo. Details:
[docs/conventions/git-workflow.md](docs/conventions/git-workflow.md).

## Docs

Start at [docs/README.md](docs/README.md): it lists every doc and when to read it. **Read only
the docs relevant to the current task**, never all of them. The docs are split by topic so you can
load just what you need (e.g. a styling tweak → styling; a new form → forms-and-errors). Most
tasks need:

- [docs/rules/frontend-invariants.md](docs/rules/frontend-invariants.md): rules that must always hold.
- [docs/architecture.md](docs/architecture.md): stack table (keep it updated), backend, auth, env.
- [docs/conventions/data-fetching.md](docs/conventions/data-fetching.md): Server/Client split and
  backend calls.
