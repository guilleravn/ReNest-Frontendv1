import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Listing } from "../schemas";
import { FeedItemCard } from "./feed-item-card";

const baseListing: Listing = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Silla de madera",
  priceCents: 150000,
  photoUrl: "https://example.com/photo.jpg",
  status: "ACTIVE",
  createdAt: "2026-10-06T00:00:00.000Z",
};

describe("FeedItemCard", () => {
  it("links to the item's detail page", () => {
    render(<FeedItemCard listing={baseListing} />);

    expect(screen.getByRole("link", { name: /silla de madera/i })).toHaveAttribute(
      "href",
      `/items/${baseListing.id}`,
    );
  });

  it("shows the formatted price", () => {
    render(<FeedItemCard listing={baseListing} />);

    expect(screen.getByText("$1,500")).toBeInTheDocument();
  });

  it("renders a placeholder instead of crashing when the listing has no photo", () => {
    render(<FeedItemCard listing={{ ...baseListing, photoUrl: null }} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /silla de madera/i })).toBeInTheDocument();
  });
});
