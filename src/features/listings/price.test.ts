import { describe, expect, it } from "vitest";

import { formatPriceCents } from "./price";

describe("formatPriceCents", () => {
  it.each([
    [150000, "$1,500"],
    [2500000, "$25,000"],
    [100, "$1"],
  ])("formats %i cents as %s", (priceCents, expected) => {
    expect(formatPriceCents(priceCents)).toBe(expected);
  });
});
