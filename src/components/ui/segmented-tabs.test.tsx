import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SegmentedTabs } from "./segmented-tabs";

describe("SegmentedTabs", () => {
  it("links each tab and marks only the active one as current", () => {
    render(
      <SegmentedTabs
        label="Estado"
        tabs={[
          { label: "Agendadas", href: "/purchases", isActive: false },
          { label: "Completadas", href: "/purchases?status=completed", isActive: true },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Estado" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agendadas" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Completadas" })).toHaveAttribute(
      "href",
      "/purchases?status=completed",
    );
    expect(screen.getByRole("link", { name: "Completadas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
