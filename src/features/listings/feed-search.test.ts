import { describe, expect, it } from "vitest";

import { MAX_SEARCH_QUERY_LENGTH, buildFeedSearchHref, parseSearchQuery } from "./feed-search";

describe("parseSearchQuery", () => {
  it.each([
    [undefined, ""],
    ["", ""],
    ["   ", ""],
    ["  armchair ", "armchair"],
    [["armchair", "lamp"], ""],
  ])("reads %j as %j", (value, expected) => {
    expect(parseSearchQuery(value)).toBe(expected);
  });

  it(`caps the query at ${MAX_SEARCH_QUERY_LENGTH} characters`, () => {
    expect(parseSearchQuery("a".repeat(200))).toHaveLength(MAX_SEARCH_QUERY_LENGTH);
  });
});

describe("buildFeedSearchHref", () => {
  it("sets the search on a bare feed URL", () => {
    expect(buildFeedSearchHref(new URLSearchParams(), "armchair")).toBe("/feed?q=armchair");
  });

  it("replaces a previous search and trims the new one", () => {
    expect(buildFeedSearchHref(new URLSearchParams("q=lamp"), "  oak ")).toBe("/feed?q=oak");
  });

  it("encodes special characters", () => {
    expect(buildFeedSearchHref(new URLSearchParams(), "silla & mesa")).toBe(
      "/feed?q=silla+%26+mesa",
    );
  });

  it("goes back to the bare feed URL when the search is cleared", () => {
    expect(buildFeedSearchHref(new URLSearchParams("q=lamp"), "")).toBe("/feed");
    expect(buildFeedSearchHref(new URLSearchParams("q=lamp"), "   ")).toBe("/feed");
  });

  it("keeps the category filter when searching and when clearing", () => {
    const params = new URLSearchParams("category=muebles&q=lamp");

    expect(buildFeedSearchHref(params, "oak")).toBe("/feed?category=muebles&q=oak");
    expect(buildFeedSearchHref(params, "")).toBe("/feed?category=muebles");
  });

  it("does not mutate the params it receives", () => {
    const params = new URLSearchParams("q=lamp");

    buildFeedSearchHref(params, "oak");

    expect(params.get("q")).toBe("lamp");
  });
});
