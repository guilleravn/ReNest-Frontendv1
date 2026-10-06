import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SEARCH_DEBOUNCE_MS, SearchField } from "./search-field";

const replace = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => currentParams,
}));

function setup(defaultQuery = "") {
  const user = userEvent.setup({ delay: null });
  const view = render(<SearchField defaultQuery={defaultQuery} />);
  return { user, ...view };
}

const searchBox = () => screen.getByRole("searchbox", { name: "Buscar por título" });

describe("SearchField", () => {
  beforeEach(() => {
    // Testing Library waits on a real setTimeout(0) after each interaction and only knows how to
    // flush Jest's fake timers, so the clock must keep moving on its own. The debounce is still
    // driven by hand: typing with `delay: null` takes far less than SEARCH_DEBOUNCE_MS.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"], shouldAdvanceTime: true });
    currentParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("shows the search currently applied", () => {
    setup("lamp");

    expect(searchBox()).toHaveValue("lamp");
  });

  it("searches once, after the user stops typing", async () => {
    const { user } = setup();

    await user.type(searchBox(), "armchair");

    expect(replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith("/feed?q=armchair", { scroll: false });
  });

  it("searches immediately on Enter, without a second debounced search", async () => {
    const { user } = setup();

    await user.type(searchBox(), "oak{Enter}");

    expect(replace).toHaveBeenCalledWith("/feed?q=oak", { scroll: false });

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    expect(replace).toHaveBeenCalledOnce();
  });

  it("keeps the category filter while searching", async () => {
    currentParams = new URLSearchParams("category=muebles");
    const { user } = setup();

    await user.type(searchBox(), "oak{Enter}");

    expect(replace).toHaveBeenCalledWith("/feed?category=muebles&q=oak", { scroll: false });
  });

  it("clears the search immediately, keeping the category filter", async () => {
    currentParams = new URLSearchParams("category=muebles&q=lamp");
    const { user } = setup("lamp");

    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));

    expect(replace).toHaveBeenCalledWith("/feed?category=muebles", { scroll: false });
    expect(searchBox()).toHaveValue("");
    expect(searchBox()).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();
  });

  it("cancels a pending search when the field is cleared", async () => {
    const { user } = setup();

    await user.type(searchBox(), "lam");
    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith("/feed", { scroll: false });
  });

  it("hides the clear button while the field is empty", () => {
    setup();

    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();
  });

  it("follows a search changed from outside the field, e.g. the home tab or back/forward", () => {
    const { rerender } = setup("armchair");

    rerender(<SearchField defaultQuery="" />);

    expect(searchBox()).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).not.toBeInTheDocument();
  });

  it("follows the browser back to a search the field itself made earlier", async () => {
    const { user, rerender } = setup();
    await user.type(searchBox(), "oak{Enter}");
    rerender(<SearchField defaultQuery="oak" />);

    rerender(<SearchField defaultQuery="" />); // home link
    rerender(<SearchField defaultQuery="oak" />); // browser back

    expect(searchBox()).toHaveValue("oak");
  });

  it("does not flash back to the old search while its own clear is still loading", async () => {
    const { user, rerender } = setup("lamp");

    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    rerender(<SearchField defaultQuery="lamp" />);

    expect(searchBox()).toHaveValue("");
  });

  it("does not overwrite what the user keeps typing when their own search lands", async () => {
    const { user, rerender } = setup();

    await user.type(searchBox(), "oak");
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    await user.type(searchBox(), " chair");
    rerender(<SearchField defaultQuery="oak" />);

    expect(searchBox()).toHaveValue("oak chair");
  });

  it("does not search after it unmounts", async () => {
    const { user, unmount } = setup();

    await user.type(searchBox(), "lamp");
    unmount();
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));

    expect(replace).not.toHaveBeenCalled();
  });
});
