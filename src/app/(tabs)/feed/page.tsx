import { Suspense } from "react";

import { FeedResults } from "@/features/listings/components/feed-results";
import { FeedSkeleton } from "@/features/listings/components/feed-skeleton";
import { FeedStatus } from "@/features/listings/components/feed-status";
import { SearchField } from "@/features/listings/components/search-field";
import { FEED_LOADING_ANNOUNCEMENT } from "@/features/listings/feed-announcement";
import { parseSearchQuery } from "@/features/listings/feed-search";

export default async function FeedPage({ searchParams }: PageProps<"/feed">) {
  const q = parseSearchQuery((await searchParams).q);

  return (
    <>
      <h1 className="font-heading text-3xl max-sm:text-2xl">Encuentra algo con historia</h1>
      <div className="mt-6">
        <SearchField defaultQuery={q} />
      </div>
      {/* The live region stays mounted across searches (only its text changes), so screen
          readers announce loading, the result count and "no matches". A region inserted fresh
          inside the keyed Suspense below would usually go unannounced. */}
      <div role="status" className="sr-only">
        <Suspense key={q} fallback={FEED_LOADING_ANNOUNCEMENT}>
          <FeedStatus q={q} />
        </Suspense>
      </div>
      {/* Keyed by the search so a new query shows the skeleton instead of stale results. */}
      <Suspense key={q} fallback={<FeedSkeleton />}>
        <FeedResults q={q} />
      </Suspense>
    </>
  );
}
