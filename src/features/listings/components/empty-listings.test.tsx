import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyListings } from "./empty-listings";

describe("EmptyListings", () => {
  it.each([
    ["ACTIVE", /no tienes publicaciones activas/i],
    ["PENDING", /no tienes publicaciones pendientes/i],
    ["COMPLETED", /aún no tienes ventas completadas/i],
  ] as const)("shows status-specific copy for %s", (status, expectedText) => {
    render(<EmptyListings status={status} />);

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it("shows different copy for each status", () => {
    const { unmount: unmountActive } = render(<EmptyListings status="ACTIVE" />);
    const activeCopy = screen.getByRole("status").textContent;
    unmountActive();

    const { unmount: unmountCompleted } = render(<EmptyListings status="COMPLETED" />);
    const completedCopy = screen.getByRole("status").textContent;
    unmountCompleted();

    expect(activeCopy).not.toBe(completedCopy);
  });
});
