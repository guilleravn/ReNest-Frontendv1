import { describe, expect, it } from "vitest";

import { listingsResponseSchema, listingSchema } from "./schemas";

const validListing = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Silla de madera",
  priceCents: 150000,
  photoUrl: "https://example.com/photo.jpg",
  status: "ACTIVE",
  createdAt: "2026-10-06T00:00:00.000Z",
};

describe("listingSchema", () => {
  it("accepts a well-formed listing", () => {
    expect(listingSchema.safeParse(validListing).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(listingSchema.safeParse({ ...validListing, status: "SOLD" }).success).toBe(false);
  });

  it("rejects a non-uuid id", () => {
    expect(listingSchema.safeParse({ ...validListing, id: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects a non-ISO createdAt", () => {
    expect(listingSchema.safeParse({ ...validListing, createdAt: "2026-10-06" }).success).toBe(
      false,
    );
  });

  it.each([1500.5, -100])("rejects a priceCents of %d", (priceCents) => {
    expect(listingSchema.safeParse({ ...validListing, priceCents }).success).toBe(false);
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
});

describe("listingsResponseSchema", () => {
  it("accepts an empty data array (the normal empty-tab case)", () => {
    const result = listingsResponseSchema.safeParse({ data: [], meta: { total: 0 } });

    expect(result.success).toBe(true);
  });

  it("accepts a populated response", () => {
    const result = listingsResponseSchema.safeParse({
      data: [validListing],
      meta: { total: 1 },
    });

    expect(result.success).toBe(true);
  });

  it("rejects a response missing meta", () => {
    expect(listingsResponseSchema.safeParse({ data: [] }).success).toBe(false);
  });
});
