import { describe, expect, it } from "vitest";

import { formatResultCount, formatShownOfTotal, getNoMatchHint } from "./feed-copy";

describe("formatResultCount", () => {
  it("uses the singular for one result", () => {
    expect(formatResultCount(1)).toBe("1 resultado");
  });

  it.each([0, 2, 45])("uses the plural for %i results", (total) => {
    expect(formatResultCount(total)).toBe(`${total} resultados`);
  });
});

describe("formatShownOfTotal", () => {
  it("says how many of the matches are listed", () => {
    expect(formatShownOfTotal(20, 45)).toBe("Mostrando 20 de 45 artículos.");
  });
});

describe("getNoMatchHint", () => {
  it("names the search that found nothing", () => {
    expect(getNoMatchHint("zzz")).toBe("Ningún artículo con “zzz”. Prueba con otra palabra.");
  });
});
