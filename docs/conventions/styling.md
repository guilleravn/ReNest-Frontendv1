# Styling

## Visual reference

The design model to follow is [renestapp.vercel.app/feed](https://renestapp.vercel.app/feed): a
live reference for **palette, typography, shape (radii/shadows) and overall style**. Use it to
get the general feel of a screen; do **not** copy its layout or breakpoints — that page is
**not responsive**, while this app must stay usable down to 320px (INV-4).

When a screen or component has no equivalent on that page, don't invent an unrelated look:
follow its style (same tokens, same type pairing, same shape language) and stay coherent with
what does exist there.

## Tools and tokens

- ✅ **Tailwind first** for all styling. Use **CSS Modules** (`listing-card.module.css`, see
  [naming.md](naming.md)) only for what Tailwind expresses poorly (complex animations, keyframes,
  third-party overrides).
- **Both themes, dark by default.** Design tokens are CSS variables in
  [src/app/globals.css](../../src/app/globals.css), exposed to Tailwind via `@theme inline`:
  - Surfaces: `bg-background`, `bg-surface`, `bg-surface-sunken`, `border-border`,
    `border-border-strong`.
  - Text: `text-foreground`, `text-muted`, `text-subtle`.
  - Brand: `bg-primary`/`text-primary` (+ `-hover`/`-active`), `text-primary-foreground`.
  - Status: `success`/`warning`/`error`/`info`, each with a `-surface` variant for its pill
    background (e.g. `bg-success-surface text-success`).
  - Listing semantics: `verified`/`protected` (trust badges) and `price`/`price-reduced`, each
    following the same color/`-surface` pattern.
  - Shape: `rounded-sm`/`md`/`lg`/`xl` (redefined from `--radius`), `shadow-card`, `shadow-menu`,
    `shadow-sheet`. Shape doesn't change between themes.
  - Type: `font-sans` (Urbanist, body/UI) and `font-heading` (Playfair Display, standing in for
    the reference's proprietary Diphylleia — its own fallback chain already points there). Type
    doesn't change between themes either.
  - The reference app is light-only, so its palette extraction became our **light** theme,
    under the `[data-theme="light"]` selector in `globals.css`. **Dark is the default**
    (unqualified `:root`) and is our own palette, derived from the same hues — same brand
    emerald and status colors, relit for a dark surface. `<html data-theme="dark">` in
    `layout.tsx` sets it explicitly; there's no switcher UI yet, so don't build light-mode-only
    screens — every token resolves correctly in both, so default styling already works in both.
- ✅ Only theme tokens. ❌ raw colors (`text-zinc-400`, `#22c55e`): add the token to
  `globals.css` first.
- Class order is enforced by `prettier-plugin-tailwindcss`; run `npm run format`.
- ❌ `style={{}}` except for truly dynamic values (e.g. a computed CSS var).

## Classes

- ✅ Complete, static class names; variants via a map: `BUTTON_VARIANTS[variant]`. ❌ classes
  built by interpolation (`bg-${color}-500`): Tailwind does not detect them.

## Layout and responsiveness

ReNest is a web app designed **desktop-first** that must stay fully usable down to phone widths
(INV-4, [frontend-invariants.md](../rules/frontend-invariants.md)).

### Direction: desktop-first

- ✅ Unprefixed classes describe the **desktop** layout. Narrower screens **subtract** with the
  `max-*` variants, largest first: `max-xl:` → `max-lg:` → `max-md:` → `max-sm:`.
  ```tsx
  <ul className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
  ```
- ❌ Min-width variants (`sm:`/`md:`/`lg:`) for layout. ❌ Mixing both directions on the same
  property of the same element (`grid-cols-1 md:grid-cols-3 max-lg:grid-cols-2`): nobody can tell
  which one wins. A closed range (`md:max-lg:`) is fine for a style that only applies to one band.
- ✅ Each `max-*` writes **only what changes**. Everything else (`display`, `gap`, colors, type)
  is inherited from the desktop base.
- ✅ Undo desktop placements explicitly. `col-start-*`, `row-span-*` and `order-*` keep applying
  on narrower screens: reset them (`max-md:col-auto`, `max-md:row-auto`). Prefer `col-span-full`
  to `col-span-3`. A span that counts tracks creates phantom columns, and so horizontal scroll,
  once the grid has fewer columns.
- ✅ Write the HTML in **reading order**, which is the stacked order on a phone. Grid places it on
  desktop. ❌ Reordering that changes the meaning of the tab order
  ([accessibility.md](accessibility.md)).

### Breakpoints

- ✅ Tailwind's defaults (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem) unless the design needs
  others. Then redefine them once as `--breakpoint-*` in `@theme` in
  [globals.css](../../src/app/globals.css). ❌ Arbitrary one-offs (`max-[812px]:`) scattered
  across components. ❌ Breakpoints that target a device ("iPhone width").
- ✅ As few as possible, usually 2–3 (desktop → tablet → phone). Add one only where the layout
  actually breaks when the window is narrowed: lines too long, a column too narrow to read,
  overflow, or absurd gaps. A breakpoint may change a single declaration.
- ✅ Before adding a breakpoint, try intrinsic layout:
  `grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))]` for "as many columns as fit",
  `flex-wrap`, `max-w-prose` for text, `clamp()` for type sizes.

### Sizing

- ✅ Containers are fluid: `w-full max-w-*`. ❌ Fixed widths (`w-[1200px]`, `min-w-[900px]`) on
  layout containers. That is the most common desktop-first bug: the desktop looks perfect and
  every narrower screen scrolls horizontally.
- ✅ On wide screens, cap and center the content (`mx-auto max-w-7xl`) and keep text around 45–75
  characters per line (`max-w-prose`).
- ✅ `min-w-0` on grid/flex children that hold long text or URLs, so they can shrink and
  truncate/wrap instead of overflowing.
- ✅ Content that is wider by nature (data tables, code) scrolls **inside its own wrapper**
  (`overflow-x-auto`). The page itself never scrolls horizontally.

### Small screens

- ✅ Navigation: a row of links on desktop. Below the breakpoint where it no longer fits, it
  collapses into a menu button that opens a disclosure or `<dialog>`, following the dialog rules
  in [accessibility.md](accessibility.md).
- ✅ Hiding with `max-*:hidden` is only for decoration or duplicates. ❌ Hiding content or actions
  that the phone user needs: move them into a menu or disclosure instead.
- ✅ Touch: interactive targets are at least 24×24 CSS px (WCAG 2.2). Aim for about 44px on small
  screens. Nothing works by hover alone (Tailwind 4 applies `hover:` only on hover-capable
  devices).
- ✅ When the design only has desktop mockups, collapse with the defaults above: stack the
  columns in source order, wrap the toolbars, and put the nav in a menu. Note it in
  `.claude/NOTES.md`. If collapsing would drop or change content, ask instead of deciding.

### Grid, Flexbox and container queries

- ✅ Grid for two-dimensional layouts and pages; Flexbox for one-dimensional strips (navbars,
  toolbars, tags). `gap-*` between items, `p-*` inside; ❌ margins between siblings
  (`space-*`/`mt-*` on each item) when `gap` works.
- ✅ Container queries (`@container` + `@max-md:` etc., also desktop-first) when the look
  depends on the component's available space, e.g. a card that lives both in a sidebar and in
  the main column. Use media queries for page layout.

## Motion and media

- ✅ Respect `motion-reduce:` in animations; animate only `opacity`/`transform`.
- ✅ `next/image` with `alt`, and `width`/`height` or `fill` + `sizes`. ❌ raw `<img>` (lint
  flags it).
- ✅ `sizes` matches the real layout at each breakpoint, written desktop-first like the classes:
  `sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 25vw"`. ❌ Leaving out `sizes` on a
  `fill` image: phones then download the desktop-sized file.
