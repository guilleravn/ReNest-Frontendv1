import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe("ErrorPage", () => {
  it("announces a generic message without the raw error", () => {
    render(<ErrorPage error={new Error("fetch failed: ECONNREFUSED")} retry={() => {}} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Algo salió mal");
    expect(alert).toHaveTextContent(
      "No pudimos cargar esta página. Intenta de nuevo en unos segundos.",
    );
    expect(screen.queryByText(/ECONNREFUSED/)).not.toBeInTheDocument();
  });

  it("retries the failed segment", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<ErrorPage error={new Error("boom")} retry={retry} />);

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
