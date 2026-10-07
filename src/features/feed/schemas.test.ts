import { describe, expect, it } from "vitest";

import {
  categoriesResponseSchema,
  categorySchema,
  feedResponseSchema,
  listingSchema,
} from "./schemas";

const validListing = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Silla de madera",
  priceCents: 150000,
  photoUrl: "https://example.com/photo.jpg",
  status: "ACTIVE",
  createdAt: "2026-10-06T00:00:00.000Z",
};

const validCategory = {
  id: "423e4567-e89b-12d3-a456-426614174000",
  name: "Furniture",
  slug: "furniture",
};

describe("listingSchema", () => {
  it("accepts a well-formed listing", () => {
    expect(listingSchema.safeParse(validListing).success).toBe(true);
  });

  it("accepts a null photoUrl (a listing can have zero photos at the DB level)", () => {
    expect(listingSchema.safeParse({ ...validListing, photoUrl: null }).success).toBe(true);
  });

  it("accepts the bare storage key the backend actually returns, not a full URL", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      photoUrl: "listings/018f6e5c-0000-7000-8000-000000000101/photo-0.jpg",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(listingSchema.safeParse({ ...validListing, status: "SOLD" }).success).toBe(false);
  });

  it("strips unknown fields like categoryId/sellerId, not part of the real /feed contract", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      categoryId: "223e4567-e89b-12d3-a456-426614174000",
      sellerId: "323e4567-e89b-12d3-a456-426614174000",
    });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("categoryId");
    expect(result.data).not.toHaveProperty("sellerId");
  });

  it.each([1500.5, -100])("rejects a priceCents of %d", (priceCents) => {
    expect(listingSchema.safeParse({ ...validListing, priceCents }).success).toBe(false);
  });
});

describe("feedResponseSchema", () => {
  it("accepts an empty data array (the normal no-results case)", () => {
    const result = feedResponseSchema.safeParse({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0 },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a populated response", () => {
    const result = feedResponseSchema.safeParse({
      data: [validListing],
      meta: { page: 1, pageSize: 20, total: 1 },
    });

    expect(result.success).toBe(true);
  });

  it("rejects a response missing meta.pageSize", () => {
    const result = feedResponseSchema.safeParse({
      data: [],
      meta: { page: 1, total: 0 },
    });

    expect(result.success).toBe(false);
  });
});

describe("categorySchema", () => {
  it("accepts a well-formed category", () => {
    expect(categorySchema.safeParse(validCategory).success).toBe(true);
  });

  it("rejects an empty slug", () => {
    expect(categorySchema.safeParse({ ...validCategory, slug: "" }).success).toBe(false);
  });
});

describe("categoriesResponseSchema", () => {
  it("accepts an empty category list", () => {
    expect(categoriesResponseSchema.safeParse({ data: [] }).success).toBe(true);
  });

  it("accepts a populated category list", () => {
    expect(categoriesResponseSchema.safeParse({ data: [validCategory] }).success).toBe(true);
  });

  it("rejects a response missing data", () => {
    expect(categoriesResponseSchema.safeParse({}).success).toBe(false);
  });
});
