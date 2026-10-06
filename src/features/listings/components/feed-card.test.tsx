import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FeedListing } from "../schemas";
import { FeedCard } from "./feed-card";

const baseListing: FeedListing = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Sillón de cuero",
  priceCents: 24000,
  photoUrl: "https://example.com/photo.jpg",
  category: { slug: "muebles", name: "Muebles" },
  publishedAt: "2026-10-06T00:00:00.000Z",
};

describe("FeedCard", () => {
  it("links to the item's detail page", () => {
    render(<FeedCard listing={baseListing} />);

    expect(screen.getByRole("link", { name: /sillón de cuero/i })).toHaveAttribute(
      "href",
      `/items/${baseListing.id}`,
    );
  });

  it("shows the category, title and formatted price", () => {
    render(<FeedCard listing={baseListing} />);

    expect(screen.getByText("Muebles")).toBeInTheDocument();
    expect(screen.getByText("Sillón de cuero")).toBeInTheDocument();
    expect(screen.getByText("$240")).toBeInTheDocument();
  });

  it("renders the photo when the listing has a renderable URL", () => {
    render(<FeedCard listing={baseListing} />);

    // Decorative image (alt=""), so it has the presentation role, not img.
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  it.each([null, "listings/123/photo-0.jpg"])(
    "renders a placeholder when photoUrl is %j",
    (photoUrl) => {
      render(<FeedCard listing={{ ...baseListing, photoUrl }} />);

      expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /sillón de cuero/i })).toBeInTheDocument();
    },
  );
});
