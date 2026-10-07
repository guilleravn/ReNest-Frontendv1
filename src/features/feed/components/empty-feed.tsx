type EmptyFeedProps = {
  hasCategory: boolean;
  hasSearch: boolean;
};

/**
 * Copy for when the current filter combination returns no listings (BO-6's unhappy path: a
 * category plus a search that matches nothing in it). Four distinct cases, from most to least
 * specific, so the message always names the filter(s) actually narrowing the result.
 */
export function getEmptyFeedMessage(hasCategory: boolean, hasSearch: boolean): string {
  if (hasCategory && hasSearch) {
    return "No encontramos artículos que coincidan con tu búsqueda en esta categoría.";
  }
  if (hasSearch) {
    return "No encontramos artículos que coincidan con tu búsqueda.";
  }
  if (hasCategory) {
    return "No hay artículos en esta categoría por ahora.";
  }
  return "Aún no hay artículos publicados.";
}

export function EmptyFeed({ hasCategory, hasSearch }: EmptyFeedProps) {
  return (
    <p className="text-muted mt-8 text-center text-sm">
      {getEmptyFeedMessage(hasCategory, hasSearch)}
    </p>
  );
}
