import type { FeedResponse } from "./schemas";

/** Status-region text while a search is loading. */
export const FEED_LOADING_ANNOUNCEMENT = "Cargando artículos…";

/**
 * What the feed's persistent status region says once a search lands. It mirrors the visible
 * state (count, no-match message or empty feed) in words that don't duplicate the visible count
 * line, which isn't a live region itself.
 */
export function getFeedAnnouncement(q: string, { data, meta }: FeedResponse): string {
  if (data.length === 0) {
    return q
      ? `Todavía no hay coincidencias. Ningún artículo con “${q}”. Prueba con otra palabra.`
      : "Todavía no hay artículos publicados.";
  }

  return meta.total === 1 ? "1 artículo encontrado." : `${meta.total} artículos encontrados.`;
}
