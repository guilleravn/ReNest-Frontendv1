import { describe, expect, it } from "vitest";

import { LISTING_STATUS_TABS, parseListingStatus } from "./listing-status";

describe("parseListingStatus", () => {
  it.each([
    [undefined, "PENDING"],
    ["ACTIVE", "ACTIVE"],
    ["PENDING", "PENDING"],
    ["COMPLETED", "COMPLETED"],
    ["bogus", "PENDING"],
    [["ACTIVE", "COMPLETED"], "PENDING"],
  ])("reads %j as %s", (value, expected) => {
    expect(parseListingStatus(value)).toBe(expected);
  });
});

describe("LISTING_STATUS_TABS", () => {
  it("puts sales in progress first, on the bare /listings URL", () => {
    expect(LISTING_STATUS_TABS[0]).toEqual({
      status: "PENDING",
      label: "En proceso",
      href: "/listings",
    });
  });
});
