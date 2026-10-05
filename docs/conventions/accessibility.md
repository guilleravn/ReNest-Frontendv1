# Accessibility

Target: WCAG 2.2 AA.

- ✅ Semantic HTML first: `button` for actions, `a`/`<Link>` for navigation, landmarks
  (`header`, `nav`, `main`, `footer`), one `h1` per page and a heading hierarchy without gaps.
- ❌ `div`/`span` with `onClick`. If truly needed: `role`, `tabIndex={0}` and keyboard handling
  (but the answer is almost always a `<button>`).
- ✅ Every control has an accessible name: a visible label, or `aria-label` on icon-only buttons;
  decorative icons get `aria-hidden`.
- ✅ Everything operable by keyboard; visible focus (`focus-visible:` ring using a token); ❌
  `outline-none` without an alternative.
- ✅ Dynamic messages: errors in `role="alert"`, non-urgent status in `aria-live="polite"` (e.g.
  "Saved").
- ✅ Dialogs/menus: prefer the native `<dialog>`; move focus on open and return it on close;
  close with Escape. If something more complex is needed, propose a library in the plan.
- ✅ DOM order = reading order; ❌ visually reordering with `order`/grid in a way that changes
  the meaning of the tab order.
- ✅ AA contrast with the tokens (text ≥ 4.5:1); correct `<html lang>`; never convey information
  by color alone.
- ❌ `user-scalable=no` / `maximum-scale=1` in the viewport.
- ✅ Reflow: usable at 320 CSS px without horizontal scroll (INV-4). ✅ Pointer targets ≥ 24×24
  CSS px. Responsive rules are in [styling.md](styling.md#layout-and-responsiveness).

Form-specific rules (labels, `aria-describedby`, `fieldset`) are in
[forms-and-errors.md](forms-and-errors.md).
