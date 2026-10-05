# Components, hooks and state

## Components

- ✅ Destructure props in the signature, with defaults right there: `{ size = "md", ...props }`.
- ✅ Wrappers of native elements extend their props and forward the rest; the spread goes
  **before** whatever the component must control, and `className` is merged, not overwritten:

```tsx
type ButtonProps = React.ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[BUTTON_VARIANTS[variant], className].filter(Boolean).join(" ")}
    />
  );
}
```

- ✅ React 19: `ref` is a normal prop. ❌ `forwardRef` in new code.
- ✅ Context: `use(XContext)` and `<XContext value={...}>`; the `useX` hook throws when there is
  no provider (`"useFilters must be used within <FiltersProvider>"`). Scope context to the subtree
  that needs it, never "global just in case".
- ✅ Stable keys from the data (`key={listing.id}`). ❌ `key={index}` in lists that change;
  ❌ `Math.random()`. ✅ Change `key` to reset a subtree instead of using an effect.
- ✅ Prefer composition (`children`, slots) over adding configuration props or context.
- ✅ Extract a hook only when there is repeated stateful logic or logic that deserves its own
  test; ❌ premature abstractions.
- ✅ `useId` for label/input ids in reusable components; ❌ hardcoded or random ids.

## Effects (and how to avoid them)

- ❌ `useEffect` to derive data from props/state: compute it during render.
- ❌ `useEffect` + `fetch` + `useState`: server data goes through a Server Component or TanStack
  Query (see [data-fetching.md](data-fetching.md)).
- ✅ If there is an effect: all dependencies (respect `react-hooks/exhaustive-deps`), clean up
  listeners/timers/subscriptions, and keep dependencies primitive (create objects inside the
  effect).
- ✅ `useSyncExternalStore` to subscribe to browser APIs; lazy init (`useState(() => read())`)
  for expensive initial values.
- ❌ Reading/writing `ref.current` during render. ❌ `useMemo`/`useCallback` by reflex: only for
  a measured cost or a memoized dependency/child that requires it.

## State

**No global state library.** The decision is deferred until a real need shows up. Order of
preference:

1. Server data → fetched in Server Components, or cached by TanStack Query on the client.
2. Shareable UI state (filters, tabs, pagination, search) → the URL (`searchParams`).
3. Local UI state → `useState` in the component that owns it.
4. Cross-component client state that doesn't fit the above → React context scoped to the subtree
   that needs it.

If a case comes up that none of these handles cleanly, propose a library (e.g. Zustand) in plan
mode with the concrete case; don't add one preemptively.

- ✅ Minimal state: if it can be computed, don't store it. ❌ duplicating server data in
  `useState`.
- ✅ Lift state to the closest common ancestor, no higher; push it back down when it stops
  being shared.
- ✅ Immutable updates (`[...items, x]`, `items.with(i, v)`, `filter`) and the functional setter
  when the new value depends on the previous one.
- ✅ `useReducer` when several pieces change together or there are transition rules. Actions
  `{ type: "itemAdded", ... }` (camelCase, past tense), pure reducer, exhaustive `default`.
- ✅ Children receive `onX` callbacks; ❌ passing raw setters (`setCount`) as props.
