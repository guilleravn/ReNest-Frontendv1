import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyFeed, getEmptyFeedMessage } from "./empty-feed";

describe("getEmptyFeedMessage", () => {
  it("names both filters when a category and a search are combined (BO-6's unhappy path)", () => {
    expect(getEmptyFeedMessage(true, true)).toBe(
      "No encontramos artículos que coincidan con tu búsqueda en esta categoría.",
    );
  });

  it("names only the search when there is no category filter", () => {
    expect(getEmptyFeedMessage(false, true)).toBe(
      "No encontramos artículos que coincidan con tu búsqueda.",
    );
  });

  it("names only the category when there is no search", () => {
    expect(getEmptyFeedMessage(true, false)).toBe("No hay artículos en esta categoría por ahora.");
  });

  it("falls back to a generic empty-feed message with no filters at all", () => {
    expect(getEmptyFeedMessage(false, false)).toBe("Aún no hay artículos publicados.");
  });
});

describe("EmptyFeed", () => {
  it("renders the message for the given filter combination", () => {
    render(<EmptyFeed hasCategory={true} hasSearch={true} />);

    expect(
      screen.getByText("No encontramos artículos que coincidan con tu búsqueda en esta categoría."),
    ).toBeInTheDocument();
  });
});
