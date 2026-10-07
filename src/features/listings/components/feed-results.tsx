import { getFeed } from "../api";
import { formatResultCount, formatShownOfTotal } from "../feed-copy";
import { EmptyFeed } from "./empty-feed";
import { FeedCard } from "./feed-card";
import { FEED_GRID_CLASS_NAME } from "./feed-grid";

type FeedResultsProps = {
  /** Title search, already normalized by `parseSearchQuery` ("" = no search). */
  q: string;
  /** Feed URL with the search removed and every other param kept, for the no-match state. */
  clearSearchHref: string;
};

/**
 * Fetches and lists the home feed for one search. Errors are thrown on purpose and caught by the
 * error boundary around the results on the feed page.
 */
export async function FeedResults({ q, clearSearchHref }: FeedResultsProps) {
  const {
    data: listings,
    meta: { total },
  } = await getFeed({ q });

  if (listings.length === 0) return <EmptyFeed query={q} clearSearchHref={clearSearchHref} />;

  return (
    <>
      {/* Visible only: the page's persistent status region announces the count. */}
      <p className="text-muted mt-5 text-xs">{formatResultCount(total)}</p>
      <ul className={`mt-3 ${FEED_GRID_CLASS_NAME}`}>
        {listings.map((listing) => (
          <FeedCard key={listing.id} listing={listing} />
        ))}
      </ul>
      {/* The backend returns one page of results and there is no pagination UI yet: say so
          instead of letting a truncated list look complete. */}
      {total > listings.length ? (
        <p className="text-muted mt-4 text-sm">{formatShownOfTotal(listings.length, total)}</p>
      ) : null}
    </>
  );
}
