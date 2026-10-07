import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./error-boundary";

const MESSAGE = "No pudimos cargar los artículos.";

let shouldFail = true;

function Section() {
  if (shouldFail) throw new Error("API request failed with status 500");
  return <p>Resultados</p>;
}

const router = { refresh: vi.fn() } as unknown as AppRouterInstance;

function renderBoundary() {
  return render(
    <AppRouterContext value={router}>
      <p>Fuera de la sección</p>
      <ErrorBoundary message={MESSAGE}>
        <Section />
      </ErrorBoundary>
    </AppRouterContext>,
  );
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldFail = true;
    // React logs every caught render error; keep the test output readable.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("shows the error in place of the failing section only", () => {
    renderBoundary();

    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGE);
    expect(screen.queryByText(/status 500/)).not.toBeInTheDocument();
    expect(screen.getByText("Fuera de la sección")).toBeInTheDocument();
  });

  it("re-fetches the page and shows the section again on retry", async () => {
    const user = userEvent.setup();
    renderBoundary();
    shouldFail = false;

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(router.refresh).toHaveBeenCalledOnce();
    expect(await screen.findByText("Resultados")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("starts clean when its key changes, e.g. a new search", () => {
    const { rerender } = render(
      <ErrorBoundary key="lamp" message={MESSAGE}>
        <Section />
      </ErrorBoundary>,
    );
    shouldFail = false;

    rerender(
      <ErrorBoundary key="" message={MESSAGE}>
        <Section />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Resultados")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
