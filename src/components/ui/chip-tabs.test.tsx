import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChipTabs } from "./chip-tabs";

describe("ChipTabs", () => {
  it("links each chip and marks only the active one as current", () => {
    render(
      <ChipTabs
        label="Estado"
        tabs={[
          { label: "En proceso", href: "/listings", isActive: false },
          { label: "Activos", href: "/listings?status=ACTIVE", isActive: true },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Estado" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "En proceso" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Activos" })).toHaveAttribute(
      "href",
      "/listings?status=ACTIVE",
    );
    expect(screen.getByRole("link", { name: "Activos" })).toHaveAttribute("aria-current", "page");
  });
});
