import { z } from "zod";

/**
 * A listing as returned by `GET /feed` (see docs/architecture.md). Same shape as
 * `GET /listings`'s `Listing` (ReNest-Backend serves both from the same model).
 *
 * Duplicated here instead of imported from `features/listings/schemas.ts`: feature folders don't
 * import each other's internals (docs/conventions/project-structure.md). Keep both in sync if the
 * backend shape changes.
 */
export const listingSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  priceCents: z.number().int().nonnegative(),
  // Despite the name, the backend returns a bare storage key (e.g. "listings/<id>/photo-0.jpg"),
  // not an absolute URL — see features/listings/schemas.ts's note and photo-url.ts. Nullable: a
  // listing can have zero photos at the DB level.
  photoUrl: z.string().nullable(),
  status: z.enum(["ACTIVE", "PENDING", "COMPLETED"]),
  createdAt: z.iso.datetime({ offset: true }),
});

export type Listing = z.infer<typeof listingSchema>;

/** Response of `GET /feed?category=&search=&page=&pageSize=` (see docs/architecture.md). */
export const feedResponseSchema = z.object({
  data: z.array(listingSchema),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export type FeedResponse = z.infer<typeof feedResponseSchema>;

/** A category row, as returned by `GET /categories` (see docs/architecture.md). */
export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  slug: z.string().min(1),
});

export type Category = z.infer<typeof categorySchema>;

/** Response of `GET /categories`. */
export const categoriesResponseSchema = z.object({
  data: z.array(categorySchema),
});

export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;
