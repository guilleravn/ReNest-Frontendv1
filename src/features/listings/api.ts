import "server-only";

import { apiFetch } from "@/lib/api/server";

import type { ListingStatusTab } from "./listing-status";
import { listingsResponseSchema, type ListingsResponse } from "./schemas";

/** Lists the current seller's listings, optionally filtered by status (see architecture.md). */
export function getListings(status?: ListingStatusTab): Promise<ListingsResponse> {
  const query = status ? `?status=${status}` : "";

  return apiFetch(`/listings${query}`, { schema: listingsResponseSchema });
}
