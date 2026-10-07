// ReNest-Backend's `GET /feed` rejects a `category` that doesn't match this pattern, and a
// `search` longer than this, with a 400. Dropping an out-of-range value here instead of passing
// it through keeps a bad/pasted/URL-driven value from ever reaching `apiFetch` and tripping the
// route's generic `error.tsx` (which would replace the whole page, search box included).
const CATEGORY_SLUG_PATTERN = /^[a-z0-9-]+$/;
const SEARCH_MAX_LENGTH = 100;

/**
 * Reads `?category=` from the URL: the category slug, or `undefined` when absent/empty or not a
 * valid slug (e.g. `?category=Muebles`, which the backend would otherwise reject with a 400).
 */
export function parseCategory(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && CATEGORY_SLUG_PATTERN.test(raw) ? raw : undefined;
}

/**
 * Reads `?search=` from the URL: the trimmed search term, or `undefined` when absent/blank or
 * longer than the backend accepts (dropped rather than truncated, so the result is the normal
 * search-only empty state instead of a silently-shortened query).
 */
export function parseSearch(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed && trimmed.length <= SEARCH_MAX_LENGTH ? trimmed : undefined;
}

/**
 * Builds the href for a category chip with **toggle** semantics (unlike `/listings`'s status
 * tabs, where one is always active): selecting the already-active category links back to `/feed`
 * with no `category` param, clearing the filter instead of re-selecting it. The current search
 * term, if any, is preserved either way (BO-6's unhappy path combines both filters).
 */
export function buildCategoryHref(
  slug: string,
  activeCategory: string | undefined,
  search: string | undefined,
): string {
  const params = new URLSearchParams();
  if (slug !== activeCategory) params.set("category", slug);
  if (search) params.set("search", search);

  const query = params.toString();
  return query ? `/feed?${query}` : "/feed";
}
