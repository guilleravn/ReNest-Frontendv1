import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyListings } from "./empty-listings";

describe("EmptyListings", () => {
  it.each([
    ["PENDING", "No tienes ventas en proceso."],
    ["ACTIVE", "No tienes publicaciones activas todavía."],
    ["COMPLETED", "Aún no tienes ventas completadas."],
  ] as const)("shows status-specific copy for %s", (status, expectedText) => {
    render(<EmptyListings status={status} />);

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});
