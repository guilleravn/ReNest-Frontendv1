import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppHeader } from "./app-header";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn<() => string>() }));
vi.mock("next/navigation", () => ({ usePathname }));

describe("AppHeader", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows no purchases count while it is unknown", () => {
    render(<AppHeader />);

    expect(screen.getByRole("link", { name: "Mis compras" })).toHaveAttribute("href", "/purchases");
  });

  it("shows the number of scheduled purchases it receives", () => {
    render(<AppHeader scheduledPurchasesCount={2} />);

    expect(screen.getByRole("link", { name: "Mis compras, 2 agendadas" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders the account menu it receives", () => {
    render(<AppHeader accountMenu={<button type="button">Mi cuenta</button>} />);

    expect(screen.getByRole("button", { name: "Mi cuenta" })).toBeInTheDocument();
  });

  it("links back to the parent page on detail pages", () => {
    usePathname.mockReturnValue("/items/i1/pickup");

    render(<AppHeader isDetail />);

    expect(screen.getByRole("link", { name: "Volver" })).toHaveAttribute("href", "/items/i1");
  });

  it("has no back link on top-level pages", () => {
    render(<AppHeader />);

    expect(screen.queryByRole("link", { name: "Volver" })).not.toBeInTheDocument();
  });
});
