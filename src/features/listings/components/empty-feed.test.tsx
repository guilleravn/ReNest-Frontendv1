import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyFeed } from "./empty-feed";

describe("EmptyFeed", () => {
  it("tells the user that nothing matches their search", () => {
    render(<EmptyFeed query="zzz" />);

    expect(screen.getByText("Todavía no hay coincidencias")).toBeInTheDocument();
    expect(
      screen.getByText("Ningún artículo con “zzz”. Prueba con otra palabra."),
    ).toBeInTheDocument();
  });

  it("says the feed is empty when there is no search", () => {
    render(<EmptyFeed query="" />);

    expect(screen.getByText("Todavía no hay artículos publicados.")).toBeInTheDocument();
    expect(screen.queryByText("Todavía no hay coincidencias")).not.toBeInTheDocument();
  });

  it("is not a live region of its own, so the message is announced only once", () => {
    render(<EmptyFeed query="zzz" />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
