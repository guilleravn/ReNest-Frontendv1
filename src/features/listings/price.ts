/**
 * Formats a price given in cents as a grouped integer amount with a currency-agnostic "$" sign.
 * No currency code has been decided for the MVP yet (see docs/architecture.md), so this
 * intentionally avoids `Intl.NumberFormat`'s `currency` style, which would require one. The
 * `es-419` (Latin America Spanish) locale is used for grouping since it's the only one that
 * groups small amounts (e.g. 1500) consistently instead of the generic `es` root locale, which
 * only groups from 10,000 up.
 */
export function formatPriceCents(priceCents: number): string {
  const amount = Math.round(priceCents) / 100;

  return `$${new Intl.NumberFormat("es-419", { maximumFractionDigits: 0 }).format(amount)}`;
}
