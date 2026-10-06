import { describe, expect, it } from "vitest";

import { formatPriceCents } from "./price";

describe("formatPriceCents", () => {
  it.each([
    [150000, "$1,500"],
    [100, "$1"],
    [0, "$0"],
    [999, "$10"],
  ])("formats %i cents as %s", (priceCents, expected) => {
    expect(formatPriceCents(priceCents)).toBe(expected);
  });
});
