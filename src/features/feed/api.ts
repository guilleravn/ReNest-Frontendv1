import "server-only";

import { apiFetch } from "@/lib/api/server";

import {
  categoriesResponseSchema,
  feedResponseSchema,
  type CategoriesResponse,
  type FeedResponse,
} from "./schemas";

/** Lists every category, for the feed's filter chips (see architecture.md). Unauthenticated. */
export function getCategories(): Promise<CategoriesResponse> {
  return apiFetch("/categories", { schema: categoriesResponseSchema, auth: false });
}

export type FeedFilters = {
  /** Category slug (`GET /categories`'s `slug` field), not its id. */
  category?: string;
  /** Case-insensitive substring match on the listing title. */
  search?: string;
};

/** Lists feed listings, optionally filtered by category and/or search (see architecture.md). */
export function getFeed({ category, search }: FeedFilters): Promise<FeedResponse> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);

  const query = params.size > 0 ? `?${params.toString()}` : "";

  return apiFetch(`/feed${query}`, { schema: feedResponseSchema, auth: false });
}
