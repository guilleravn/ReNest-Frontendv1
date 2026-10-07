// UI copy of the home feed shared by the visible states and the screen-reader status region, so
// the two never drift apart.

/** Heading of the empty state when a search has no matches. */
export const FEED_NO_MATCH_TITLE = "Todavía no hay coincidencias";

/** Empty state when there is no search and nothing is published. */
export const FEED_EMPTY_MESSAGE = "Todavía no hay artículos publicados.";

/** Generic error: Server Component errors reach the client without their message or status. */
export const FEED_ERROR_MESSAGE =
  "No pudimos cargar los artículos. Revisa tu conexión e inténtalo de nuevo.";

/** Hint under `FEED_NO_MATCH_TITLE`, naming the search that found nothing. */
export function getNoMatchHint(q: string): string {
  return `Ningún artículo con “${q}”. Prueba con otra palabra.`;
}

/** Visible count line above the results: every match, not just the page shown. */
export function formatResultCount(total: number): string {
  return total === 1 ? "1 resultado" : `${total} resultados`;
}

/** Shown under a truncated list (one page of results, no pagination UI yet). */
export function formatShownOfTotal(shown: number, total: number): string {
  return `Mostrando ${shown} de ${total} artículos.`;
}
