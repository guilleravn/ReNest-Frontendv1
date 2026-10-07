import { z } from "zod";

/** A seller's listing, as returned by `GET /listings` (see docs/architecture.md). */
export const listingSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  priceCents: z.number().int().nonnegative(),
  // Despite the name, the backend returns a bare storage key (e.g. "listings/<id>/photo-0.jpg"),
  // not an absolute URL — there's no public bucket/CDN yet to resolve it against (see
  // ReNest-Backend's ListingsService). `z.url()` would reject every real response, so this stays
  // a plain string. Nullable: a listing can have zero photos at the DB level.
  photoUrl: z.string().nullable(),
  status: z.enum(["ACTIVE", "PENDING", "COMPLETED"]),
  createdAt: z.iso.datetime({ offset: true }),
});

export type Listing = z.infer<typeof listingSchema>;

export const listingsResponseSchema = z.object({
  data: z.array(listingSchema),
  meta: z.object({ total: z.number().int().nonnegative() }),
});

export type ListingsResponse = z.infer<typeof listingsResponseSchema>;

/** An ACTIVE listing as shown on the home feed, from `GET /feed` (see docs/architecture.md). */
export const feedListingSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  priceCents: z.number().int().nonnegative(),
  // Same caveat as `listingSchema.photoUrl`: a bare storage key or null, not a URL yet.
  photoUrl: z.string().nullable(),
  category: z.object({ slug: z.string(), name: z.string() }),
  publishedAt: z.iso.datetime({ offset: true }),
});

export type FeedListing = z.infer<typeof feedListingSchema>;

export const feedResponseSchema = z.object({
  data: z.array(feedListingSchema),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export type FeedResponse = z.infer<typeof feedResponseSchema>;
