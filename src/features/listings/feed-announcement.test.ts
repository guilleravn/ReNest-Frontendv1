import { describe, expect, it } from "vitest";

import { getFeedAnnouncement } from "./feed-announcement";
import type { FeedResponse } from "./schemas";

const listing: FeedResponse["data"][number] = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Leather armchair",
  priceCents: 24000,
  photoUrl: null,
  category: { slug: "furniture", name: "Muebles" },
  publishedAt: "2026-10-06T00:00:00.000Z",
};

const page = (count: number, total = count): FeedResponse => ({
  data: Array.from({ length: count }, () => listing),
  meta: { page: 1, pageSize: 20, total },
});

describe("getFeedAnnouncement", () => {
  it("announces the number of results", () => {
    expect(getFeedAnnouncement("armchair", page(2))).toBe("2 artículos encontrados.");
  });

  it("uses the singular for one result", () => {
    expect(getFeedAnnouncement("leather", page(1))).toBe("1 artículo encontrado.");
  });

  it("counts every match, not just the page shown", () => {
    expect(getFeedAnnouncement("", page(20, 45))).toBe("45 artículos encontrados.");
  });

  it("announces a search with no matches with the same copy as the empty state", () => {
    expect(getFeedAnnouncement("zzz", page(0))).toBe(
      "Todavía no hay coincidencias. Ningún artículo con “zzz”. Prueba con otra palabra.",
    );
  });

  it("announces an empty feed when there is no search", () => {
    expect(getFeedAnnouncement("", page(0))).toBe("Todavía no hay artículos publicados.");
  });

  it("does not reuse the visible count wording, so the two never read as duplicates", () => {
    expect(getFeedAnnouncement("", page(5))).not.toMatch(/resultados?/);
  });
});
