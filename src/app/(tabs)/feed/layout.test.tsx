import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FeedLayout from "./layout";

describe("FeedLayout", () => {
  it("keeps the page heading above the page or its error state", () => {
    render(
      <FeedLayout params={Promise.resolve({})}>
        <p>Contenido</p>
      </FeedLayout>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Encuentra algo con historia" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
