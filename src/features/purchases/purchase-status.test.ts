import { describe, expect, it } from "vitest";

import { parsePurchaseStatus } from "./purchase-status";

describe("parsePurchaseStatus", () => {
  it.each([
    [undefined, "scheduled"],
    ["completed", "completed"],
    ["scheduled", "scheduled"],
    ["bogus", "scheduled"],
    [["completed", "scheduled"], "scheduled"],
  ])("reads %j as %s", (value, expected) => {
    expect(parsePurchaseStatus(value)).toBe(expected);
  });
});
