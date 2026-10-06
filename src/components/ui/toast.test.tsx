import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toast } from "./toast";

describe("Toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the message in a polite live region", () => {
    render(<Toast message="¡Cuenta creada! Bienvenido, Camila" onDismiss={() => {}} />);

    expect(screen.getByRole("status")).toHaveTextContent("¡Cuenta creada! Bienvenido, Camila");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("keeps an empty live region when there is no message", () => {
    render(<Toast message={null} onDismiss={() => {}} />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("dismisses from its close button", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toast message="Guardado" onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: "Cerrar aviso" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses itself after the duration", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Guardado" onDismiss={onDismiss} durationMs={4000} />);

    act(() => vi.advanceTimersByTime(3999));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
