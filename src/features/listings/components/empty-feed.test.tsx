import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyFeed } from "./empty-feed";

describe("EmptyFeed", () => {
  it("tells the user that nothing matches their search", () => {
    render(<EmptyFeed query="zzz" clearSearchHref="/feed" />);

    expect(screen.getByText("Todavía no hay coincidencias")).toBeInTheDocument();
    expect(
      screen.getByText("Ningún artículo con “zzz”. Prueba con otra palabra."),
    ).toBeInTheDocument();
  });

  it("offers to clear a search with no matches, keeping the other filters", () => {
    render(<EmptyFeed query="zzz" clearSearchHref="/feed?category=muebles" />);

    expect(screen.getByRole("link", { name: "Limpiar búsqueda" })).toHaveAttribute(
      "href",
      "/feed?category=muebles",
    );
  });

  it("says the feed is empty when there is no search", () => {
    render(<EmptyFeed query="" clearSearchHref="/feed" />);

    expect(screen.getByText("Todavía no hay artículos publicados.")).toBeInTheDocument();
    expect(screen.queryByText("Todavía no hay coincidencias")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();
  });

  it("is not a live region of its own, so the message is announced only once", () => {
    render(<EmptyFeed query="zzz" clearSearchHref="/feed" />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
