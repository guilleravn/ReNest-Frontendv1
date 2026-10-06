import { describe, expect, it } from "vitest";

import { getBackHref } from "./back-href";

describe("getBackHref", () => {
  it.each([
    ["/purchases", "/feed"],
    ["/purchases/pu1/recap", "/purchases"],
    ["/items/i1", "/feed"],
    ["/items/i1/pickup", "/items/i1"],
    ["/items/i1/contact", "/items/i1"],
    ["/unknown/path", "/feed"],
  ])("goes from %s back to %s", (pathname, expected) => {
    expect(getBackHref(pathname)).toBe(expected);
  });
});
