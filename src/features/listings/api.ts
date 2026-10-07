import "server-only";
import { cache } from "react";

import { apiFetch } from "@/lib/api/server";

import type { ListingStatusTab } from "./listing-status";
import {
  feedResponseSchema,
  listingsResponseSchema,
  type FeedResponse,
  type ListingsResponse,
} from "./schemas";

/** Lists the current seller's listings, optionally filtered by status (see architecture.md). */
export function getListings(status?: ListingStatusTab): Promise<ListingsResponse> {
  const query = status ? `?status=${status}` : "";

  return apiFetch(`/listings${query}`, { schema: listingsResponseSchema });
}

type GetFeedParams = {
  /** Title search, already normalized by `parseSearchQuery` ("" = no search). */
  q: string;
};

/** Lists the ACTIVE listings of the home feed, optionally filtered by title (see architecture.md). */
export function getFeed({ q }: GetFeedParams): Promise<FeedResponse> {
  return getFeedByQuery(q);
}

// Memoized per server request: the feed page reads the same search from two Suspense boundaries
// (results and the status region). `cache` compares arguments by identity, hence the primitive.
const getFeedByQuery = cache((q: string): Promise<FeedResponse> => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const query = params.size > 0 ? `?${params}` : "";

  return apiFetch(`/feed${query}`, { schema: feedResponseSchema });
});
