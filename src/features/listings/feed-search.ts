/** Same as the backend's `listings.title` length: a longer query can never match, and the API rejects it. */
export const MAX_SEARCH_QUERY_LENGTH = 120;

const FEED_PATH = "/feed";

/**
 * Reads `?q=` from the URL: trimmed and capped at `MAX_SEARCH_QUERY_LENGTH`. Missing, blank or
 * repeated (`?q=a&q=b`) values mean "no search" (`""`), so a hand-edited URL never errors.
 */
export function parseSearchQuery(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, MAX_SEARCH_QUERY_LENGTH).trim();
}

/**
 * Feed URL for a new search. Sets `q` (or removes it when blank) and keeps every other param,
 * so an active filter such as `?category=` survives typing or clearing the search.
 */
export function buildFeedSearchHref(currentParams: URLSearchParams, q: string): string {
  const params = new URLSearchParams(currentParams);
  const query = parseSearchQuery(q);

  if (query) params.set("q", query);
  else params.delete("q");

  const search = params.toString();
  return search ? `${FEED_PATH}?${search}` : FEED_PATH;
}
