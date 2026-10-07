import { describe, expect, it } from "vitest";

import { buildCategoryHref, parseCategory, parseSearch } from "./feed-filters";

describe("parseCategory", () => {
  it.each([
    [undefined, undefined],
    ["", undefined],
    ["furniture", "furniture"],
    [["furniture", "electronics"], "furniture"],
  ])("reads %j as %j", (value, expected) => {
    expect(parseCategory(value)).toBe(expected);
  });

  // The backend rejects a `category` not matching `^[a-z0-9-]+$` with a 400: drop it instead of
  // sending it through, so an invalid value (bad case, spaces, a name instead of a slug) falls
  // back to "no category filter" rather than a 400 reaching `apiFetch`.
  it.each([["Muebles"], ["furniture electronics"], ["furniture_1"], ["café"]])(
    "drops an invalid slug %j",
    (value) => {
      expect(parseCategory(value)).toBeUndefined();
    },
  );
});

describe("parseSearch", () => {
  it.each([
    [undefined, undefined],
    ["", undefined],
    ["   ", undefined],
    ["lamp", "lamp"],
    ["  lamp  ", "lamp"],
    [["lamp", "chair"], "lamp"],
  ])("reads %j as %j", (value, expected) => {
    expect(parseSearch(value)).toBe(expected);
  });

  // The backend rejects a `search` over 100 characters with a 400: drop it instead of sending it
  // through, so a pasted/URL-driven over-long term falls back to "no search filter" rather than a
  // 400 reaching `apiFetch`.
  it("keeps a search term exactly at the 100-character limit", () => {
    expect(parseSearch("a".repeat(100))).toBe("a".repeat(100));
  });

  it("drops a search term over the 100-character limit", () => {
    expect(parseSearch("a".repeat(101))).toBeUndefined();
  });
});

describe("buildCategoryHref", () => {
  it("selects an inactive category", () => {
    expect(buildCategoryHref("furniture", undefined, undefined)).toBe("/feed?category=furniture");
  });

  it("clears the filter when selecting the already-active category", () => {
    expect(buildCategoryHref("furniture", "furniture", undefined)).toBe("/feed");
  });

  it("preserves the search term when selecting a category", () => {
    expect(buildCategoryHref("furniture", undefined, "lamp")).toBe(
      "/feed?category=furniture&search=lamp",
    );
  });

  it("preserves the search term when clearing an active category", () => {
    expect(buildCategoryHref("furniture", "furniture", "lamp")).toBe("/feed?search=lamp");
  });

  it("switches from one active category to another", () => {
    expect(buildCategoryHref("electronics", "furniture", undefined)).toBe(
      "/feed?category=electronics",
    );
  });
});
