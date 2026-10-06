# Git workflow

## Branches and syncing

- `main` is never touched directly: no commits, no merges, no pushes to it.
- `develop` is the integration branch. Every feature/fix branch starts from `develop`, and every
  PR targets `develop`.
- Branch naming: `<type>/<linear-code>-<short-slug>` (e.g. `feat/bo-27-listing-detail-page`),
  using the same `<type>` values as commits.
- **Before starting any work** (new branch, resuming a branch, or opening a PR): fetch and check
  whether the remote has commits not yet in the local branch (`git fetch origin` then compare with
  `git log HEAD..origin/<branch>`). Always branch off the latest `origin/develop`, never a stale
  local copy.
- If syncing finds a conflict between remote changes and local uncommitted work, **stop and ask
  the user** how to handle their local changes (stash, commit first, discard) — never resolve that
  silently.

## Plan mode first

Anything non-trivial (a new feature, a new dependency, a cross-cutting refactor) starts in plan
mode: describe the files to touch, the backend endpoints involved and the tests to add, then wait
for approval before writing code. Trivial changes (typos, a one-line fix) can skip it.

If the plan needs a backend endpoint that isn't documented in
[architecture.md](../architecture.md), the plan must ask for the contract instead of assuming it.

## What a slice is

A slice is one complete, working feature, committed on its own (**one commit per slice**):

- component(s) and route(s)
- the backend call(s) (`api.ts` / `actions.ts`)
- zod schemas / types
- tests for the critical path
- doc updates (architecture route/endpoint tables, stack table if deps changed, invariants)

A slice leaves `lint`, `typecheck`, `format:check` and `test` green. The `pre-commit` hook
(`.claude/hooks/pre-commit`, enabled by `npm install` via `core.hooksPath`) checks them.

## Grouping commits

Commits are made by the QA agent right after it approves a work package, without asking for
approval. Group the changes by **functionality or area**: each commit is one coherent change that
a one-line message describes (a feature in a module, a refactor, the tests of a module).

Balance the number of commits against their size:

- Not too many: no commit per file or per tiny step (a lone DTO, an import fix).
- Not too big: an issue that spans several modules or features is split by module/feature.
- Usually 1–4 commits per work package.
- Every commit leaves the repo green (the hook checks it) and carries the docs it affects.
- Tests go with the code they verify; QA's extra tests for a module may go in their own commit.

```
feat(listings): add status filter to listings query
refactor(auth): move token parsing into the auth service
test(listings): add e2e tests for the status filter
```

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/), with the **feature/domain as
scope**:

```
✅ feat(auth): add login form with server action
✅ feat(listings): add listing detail page with empty and error states
✅ fix(listings): handle empty results from the backend
✅ chore(deps): add date-fns
✅ docs(architecture): document listings endpoints
✅ test(auth): cover invalid credentials flow
❌ Added listings page.        ❌ feat: stuff        ❌ fix(listings): Fixes bug.
```

- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`, `build`, `ci`.
- Omit the scope only when the change is repo-wide.
- Subject in imperative mood, lowercase, no trailing period, in English, ≤ 72 characters. The
  body explains the _why_ when it's not obvious.

## Rules

1. **No AI attribution** in commit messages (no `Co-Authored-By`, no "Generated with" lines).
2. **Never `git push`** unless explicitly asked in that moment.
3. Never commit `.env.local` or any secret. New env vars go in `.env.example` with a placeholder
   and in the zod schema of `src/lib/env.ts`.

## Pull requests

- **One PR per Linear ticket in this repo**, grouping every commit made for that ticket. If the
  ticket also needs work in the other repo, that's a separate PR there — link the ticket, not the
  other PR.
- PR target is always `develop`. PR title references the Linear code (e.g.
  `[BO-27] Add listing detail page`); the description summarizes the change and links the ticket.
- CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, unit tests and Playwright
  e2e (against a real ReNest-Backend instance) automatically on every PR into `develop` — it does
  not run on plain pushes to feature branches. A PR cannot merge until CI passes and at least one
  collaborator (not the author) approves it.
- The e2e job checks out `ReNest-Backend` using the `RENEST_CROSS_REPO_TOKEN` repo secret (a PAT
  with read access to both repos). If it ever needs rotating, any of the 3 collaborators can
  generate a new fine-grained PAT and update the secret in both repos' settings.
- Merge with **squash merge**: every PR collapses into a single commit on `develop`, regardless of
  how many commits the branch had. Use the PR title (`[BO-27] Add listing detail page`) as the
  squashed commit's message.
