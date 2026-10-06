import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TabNav } from "./tab-nav";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn<() => string>() }));
vi.mock("next/navigation", () => ({ usePathname }));

// jsdom ignores the responsive `hidden` classes, so both navs render; check the first one.
function getNav() {
  return screen.getAllByRole("navigation", { name: "Principal" })[0];
}

describe("TabNav", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("marks the tab of the current section as the current page", () => {
    usePathname.mockReturnValue("/listings/new");

    render(<TabNav />);

    const nav = getNav();
    expect(within(nav).getByRole("link", { name: /Mis artículos/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
  });

  it("shows no count while the number of listings in progress is unknown", () => {
    usePathname.mockReturnValue("/feed");

    render(<TabNav />);

    expect(within(getNav()).getByRole("link", { name: "Mis artículos" })).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("shows the number of listings in progress it receives", () => {
    usePathname.mockReturnValue("/feed");

    render(<TabNav listingsInProgressCount={3} />);

    expect(
      within(getNav()).getByRole("link", { name: "Mis artículos, 3 en proceso" }),
    ).toBeInTheDocument();
    expect(within(getNav()).getByText("3")).toBeInTheDocument();
  });

  it("hides the count when there are no listings in progress", () => {
    usePathname.mockReturnValue("/feed");

    render(<TabNav listingsInProgressCount={0} />);

    expect(within(getNav()).getByRole("link", { name: "Mis artículos" })).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
