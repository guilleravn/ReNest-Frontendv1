# Git workflow

## Plan mode first

Anything non-trivial (a new feature, a new dependency, a cross-cutting refactor) starts in plan
mode: describe the files to touch, the backend endpoints involved and the tests to add, then wait
for approval before writing code. Trivial changes (typos, a one-line fix) can skip it.

If the plan needs a backend endpoint that isn't documented in
[architecture.md](../architecture.md), the plan must ask for the contract instead of assuming it.

## Branches

- `main`: released code. Never commit to it directly.
- `develop`: integration branch and the base for all work (the remote's default branch).
- One branch per slice, created from an up-to-date `develop`, named `<type>/<scope>` with the
  same type and scope as its commits: `feat/app-shell`, `fix/listings-empty-state`,
  `chore/deps-date-fns`.

```bash
git checkout develop && git pull
git checkout -b feat/<scope>
```

Slice branches merge back into `develop` through a pull request. Pushing the branch and opening
the PR only happen when explicitly asked.

## What a slice is

A slice is one complete, working feature, committed on its own:

- component(s) and route(s)
- the backend call(s) (`api.ts` / `actions.ts`)
- zod schemas / types
- tests for the critical path
- doc updates (architecture route/endpoint tables, stack table if deps changed, invariants)

A slice leaves `lint`, `typecheck`, `format:check` and `test` green.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/), with the **feature/domain as
scope**:

```
feat(auth): add login form with server action
fix(listings): handle empty results from the backend
chore(deps): add date-fns
docs(architecture): document listings endpoints
test(auth): cover invalid credentials flow
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`, `build`, `ci`.
Subject in imperative mood, lowercase, no trailing period. The body explains the _why_ when it's
not obvious.

## Rules

1. Show the **full commit message in chat** and wait for approval before committing.
2. **No AI attribution** in commit messages.
3. **Never `git push`** unless explicitly asked in that moment.
4. Never commit `.env.local` or any secret. New env vars go in `.env.example` with a placeholder.
