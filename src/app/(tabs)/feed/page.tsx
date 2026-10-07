import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FeedResults } from "@/features/listings/components/feed-results";
import { FeedSkeleton } from "@/features/listings/components/feed-skeleton";
import { FeedStatus } from "@/features/listings/components/feed-status";
import { SearchField } from "@/features/listings/components/search-field";
import { FEED_LOADING_ANNOUNCEMENT } from "@/features/listings/feed-announcement";
import { FEED_ERROR_MESSAGE } from "@/features/listings/feed-copy";
import { buildFeedSearchHref, parseSearchQuery } from "@/features/listings/feed-search";

export default async function FeedPage({ searchParams }: PageProps<"/feed">) {
  const params = await searchParams;
  const q = parseSearchQuery(params.q);
  const clearSearchHref = buildFeedSearchHref(toUrlSearchParams(params), "");

  // The heading lives in ./layout.tsx, so it also stays above ./error.tsx.
  return (
    <>
      <div className="mt-6">
        <SearchField defaultQuery={q} />
      </div>
      {/* The live region stays mounted across searches (only its text changes), so screen
          readers announce loading, the result count, "no matches" or a failure. A region
          inserted fresh inside the keyed results below would usually go unannounced. */}
      <div role="status" className="sr-only">
        <Suspense key={q} fallback={FEED_LOADING_ANNOUNCEMENT}>
          <FeedStatus q={q} />
        </Suspense>
      </div>
      {/* A failed search shows its error in place of the results, below a still usable search
          field. Keyed by the search, so a new or cleared search starts without the error (Next
          would only reset it on a pathname change) and remounts the Suspense, which shows the
          skeleton instead of stale results. */}
      <ErrorBoundary key={q} message={FEED_ERROR_MESSAGE}>
        <Suspense fallback={<FeedSkeleton />}>
          <FeedResults q={q} clearSearchHref={clearSearchHref} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

/** `searchParams` as `URLSearchParams`, repeated params included. */
function toUrlSearchParams(params: Awaited<PageProps<"/feed">["searchParams"]>): URLSearchParams {
  const result = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    for (const item of [value ?? []].flat()) result.append(name, item);
  }
  return result;
}
