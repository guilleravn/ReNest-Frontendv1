import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DesktopTabNav, MobileTabNav } from "./tab-nav";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const mockPathname = (pathname: string) => vi.mocked(usePathname).mockReturnValue(pathname);

describe.each([
  ["DesktopTabNav", DesktopTabNav],
  ["MobileTabNav", MobileTabNav],
])("%s", (_name, TabNav) => {
  beforeEach(() => mockPathname("/feed"));

  it("marks Inicio as the current page on /feed", () => {
    render(<TabNav listingsCount={0} />);

    expect(screen.getByRole("link", { name: /inicio/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /mis artículos/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Mis artículos as current on nested listing routes", () => {
    mockPathname("/listings/new");
    render(<TabNav listingsCount={0} />);

    expect(screen.getByRole("link", { name: /mis artículos/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows the listings badge only when the count is positive", () => {
    const { rerender } = render(<TabNav listingsCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();

    rerender(<TabNav listingsCount={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
