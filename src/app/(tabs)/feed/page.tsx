import { Suspense } from "react";

import { FeedContent } from "@/features/feed/components/feed-content";
import { FeedSearch } from "@/features/feed/components/feed-search";
import { FeedSkeleton } from "@/features/feed/components/feed-skeleton";
import { parseCategory, parseSearch } from "@/features/feed/feed-filters";

export default async function FeedPage({ searchParams }: PageProps<"/feed">) {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const search = parseSearch(params.search);

  return (
    <>
      <h1 className="font-heading text-3xl max-sm:text-2xl">Encuentra algo con historia</h1>
      <FeedSearch className="mt-4" initialSearch={search} category={category} />
      {/* Keyed by filters so changing the category or the search term shows the skeleton again
          instead of stale results. */}
      <Suspense key={`${category ?? ""}:${search ?? ""}`} fallback={<FeedSkeleton />}>
        <FeedContent category={category} search={search} />
      </Suspense>
    </>
  );
}
