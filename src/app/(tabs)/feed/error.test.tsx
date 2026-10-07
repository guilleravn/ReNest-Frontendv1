import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FeedError from "./error";

describe("FeedError", () => {
  it("announces the failure without leaking the error message", () => {
    render(<FeedError error={new Error("API request failed with status 500")} retry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(/no pudimos cargar los artículos/i);
    expect(screen.queryByText(/status 500/)).not.toBeInTheDocument();
  });

  it("retries when the user asks to", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<FeedError error={new Error("boom")} retry={retry} />);

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(retry).toHaveBeenCalledOnce();
  });
});
