const usdFormatter = new Intl.NumberFormat("es-419", {
  style: "currency",
  currency: "USD",
  // "$1,500" instead of es-419's default "USD 1,500", as in the reference app.
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

/**
 * Formats a listing price. Every price is in whole US dollars (ReNest-Backend's
 * business-invariants.md, decided 2026-10-06), sent as cents, so no decimals are shown.
 *
 * Duplicated from `features/listings/price.ts` (feature folders don't import each other's
 * internals, see project-structure.md); promote to `src/lib/` in a slice that touches both.
 */
export function formatPriceCents(priceCents: number): string {
  return usdFormatter.format(priceCents / 100);
}
