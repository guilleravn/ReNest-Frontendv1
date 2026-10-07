import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FlashToast } from "./flash-toast";

const { clearFlashAction } = vi.hoisted(() => ({
  clearFlashAction: vi.fn<() => Promise<void>>(),
}));
vi.mock("@/lib/flash/actions", () => ({ clearFlashAction }));

describe("FlashToast", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("shows the flash message and clears it so it shows only once", async () => {
    clearFlashAction.mockResolvedValue(undefined);

    const { rerender } = render(<FlashToast message="¡Cuenta creada! Bienvenido, Camila" />);

    expect(await screen.findByText("¡Cuenta creada! Bienvenido, Camila")).toBeInTheDocument();
    expect(clearFlashAction).toHaveBeenCalled();

    // The clearing action refreshes the route: the message prop is gone, the toast stays.
    rerender(<FlashToast message={null} />);

    expect(screen.getByText("¡Cuenta creada! Bienvenido, Camila")).toBeInTheDocument();
  });

  it("renders nothing visible without a message", () => {
    render(<FlashToast message={null} />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(clearFlashAction).not.toHaveBeenCalled();
  });
});
