import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("announces the message as an alert", () => {
    render(<ErrorState message="No pudimos cargar los artículos." onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar los artículos.");
  });

  it("retries when the user asks to", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="No pudimos cargar los artículos." onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
