# TypeScript and code style

Formatting and linting are enforced by Prettier (`printWidth: 100`, double quotes, semicolons,
`prettier-plugin-tailwindcss`) and ESLint (`next/core-web-vitals` + `next/typescript`). Don't
debate formatting: run `npm run format`.

TypeScript runs in `strict` mode. Import alias: `@/*` → `src/*`.

## Declarations and exports

- ✅ `type` by default (props, unions, state). `interface` **only** for declaration merging /
  module augmentation.
- ✅ Components as declared `function`s (`export function ListingCard(...)`), not `const` +
  arrow. Helpers and callbacks: whatever reads clearest.
- ✅ Named exports. `export default` **only** where Next requires it (`page`, `layout`,
  `loading`, `error`, `not-found`, `template`, `default`; `route` uses named `GET`/`POST`).

## Types

- ❌ `any`. For external/unknown data: `unknown` + zod. ❌ `as` and `!` to silence the compiler;
  if a cast is unavoidable, keep it local, commented, and out of the public API.
- ✅ Discriminated unions for states with associated data; ❌ objects with optional flags that
  allow impossible states.

```ts
// ✅
type SubmitState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };
// ❌ { isLoading?: boolean; error?: string; data?: Listing }
```

- ✅ With a discriminated union in props, don't destructure in the signature: narrow first.
- ✅ `as const` for tuples returned by hooks and for config maps; `satisfies` to validate an
  object without losing its literals (`const X = {...} as const satisfies Record<string, ...>`).
- ✅ Derive types from the source of truth: `z.infer<typeof schema>`, `keyof typeof MAP`,
  `React.ComponentProps<"button">`. ❌ hand-duplicating unions or API shapes.
- ✅ Exhaustive checks in `switch` over unions (`const _exhaustive: never = value`).
- ✅ `React.ReactNode` for `children` and slots; render props typed as functions. ❌ `React.FC`.
- ✅ Infer return types in internal code; annotate them on exported functions in `lib/` and
  `api.ts`.
- ✅ `?.` and `??`; ❌ `||` when `0` or `""` are valid values.

## Comments

- ✅ JSDoc (`/** */`) on `lib/` functions and on non-obvious decisions. Comments explain the
  _why_, not the _what_. ❌ commented-out code.
- Identifiers, comments, sample UI text and commit messages are in English.
