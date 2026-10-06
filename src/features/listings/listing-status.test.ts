import { describe, expect, it } from "vitest";

import { parseListingStatus } from "./listing-status";

describe("parseListingStatus", () => {
  it.each([
    [undefined, "ACTIVE"],
    ["ACTIVE", "ACTIVE"],
    ["PENDING", "PENDING"],
    ["COMPLETED", "COMPLETED"],
    ["bogus", "ACTIVE"],
    [["PENDING", "COMPLETED"], "ACTIVE"],
  ])("reads %j as %s", (value, expected) => {
    expect(parseListingStatus(value)).toBe(expected);
  });
});
