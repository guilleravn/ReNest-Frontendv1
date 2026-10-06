import { getFeed } from "../api";
import { EmptyFeed } from "./empty-feed";
import { FeedCard } from "./feed-card";

type FeedResultsProps = {
  /** Title search, already normalized by `parseSearchQuery` ("" = no search). */
  q: string;
};

/**
 * Fetches and lists the home feed for one search. Errors are thrown on purpose and caught by the
 * segment's `error.tsx`.
 */
export async function FeedResults({ q }: FeedResultsProps) {
  const {
    data: listings,
    meta: { total },
  } = await getFeed({ q });

  if (listings.length === 0) return <EmptyFeed query={q} />;

  return (
    <>
      {/* Visible only: the page's persistent status region announces the count. */}
      <p className="text-muted mt-5 text-xs">
        {total} {total === 1 ? "resultado" : "resultados"}
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {listings.map((listing) => (
          <FeedCard key={listing.id} listing={listing} />
        ))}
      </ul>
      {/* The backend returns one page of results and there is no pagination UI yet: say so
          instead of letting a truncated list look complete. */}
      {total > listings.length ? (
        <p className="text-muted mt-4 text-sm">
          Mostrando {listings.length} de {total} artículos.
        </p>
      ) : null}
    </>
  );
}
