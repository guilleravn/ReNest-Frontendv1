import { StrictMode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

import { FeedSearch } from "./feed-search";

// `fireEvent.change` instead of `userEvent.type`: user-event's realistic per-keystroke delays
// don't combine reliably with fake timers (needed here to assert the debounce itself), and a
// single change event is enough to exercise this controlled input's onChange handler.

describe("FeedSearch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    replace.mockClear();
  });

  it("prefills the field with the current search term", () => {
    render(<FeedSearch initialSearch="lamp" />);

    expect(screen.getByLabelText("Buscar artículos")).toHaveValue("lamp");
  });

  it("does not update the URL on mount", () => {
    vi.useFakeTimers();
    render(<FeedSearch initialSearch="lamp" />);

    vi.advanceTimersByTime(1000);

    expect(replace).not.toHaveBeenCalled();
  });

  it("debounces typing before updating the ?search= param", () => {
    vi.useFakeTimers();
    render(<FeedSearch />);

    fireEvent.change(screen.getByLabelText("Buscar artículos"), { target: { value: "lamp" } });
    expect(replace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(400);

    expect(replace).toHaveBeenCalledWith("/feed?search=lamp");
  });

  it("clears the ?search= param when the field is emptied", () => {
    vi.useFakeTimers();
    render(<FeedSearch initialSearch="lamp" />);

    fireEvent.change(screen.getByLabelText("Buscar artículos"), { target: { value: "" } });
    vi.advanceTimersByTime(400);

    expect(replace).toHaveBeenCalledWith("/feed");
  });

  // Next's dev server runs React in StrictMode, which mounts, unmounts and re-mounts effects. A
  // "skip the first run" ref doesn't survive that, so the debounce fires once on load and can
  // overwrite a category chip navigation made in the meantime (flakes e2e/feed.spec.ts).
  it("does not update the URL on mount under StrictMode", () => {
    vi.useFakeTimers();
    render(
      <StrictMode>
        <FeedSearch initialSearch="lamp" category="furniture" />
      </StrictMode>,
    );

    vi.advanceTimersByTime(1000);

    expect(replace).not.toHaveBeenCalled();
  });

  it("shows the URL's search term again when it changes from outside the field", () => {
    const { rerender } = render(<FeedSearch initialSearch="lamp" />);

    rerender(<FeedSearch initialSearch={undefined} />);

    expect(screen.getByLabelText("Buscar artículos")).toHaveValue("");
  });

  // The URL holds the trimmed term, so the field's own debounced navigation comes back as a
  // `search` prop without the trailing space the user is still typing after. Re-syncing to it
  // would eat that space: "wooden " + pause + "table" ends up searching "woodentable".
  it("keeps a trailing space typed before its own debounced navigation lands", () => {
    vi.useFakeTimers();
    const { rerender } = render(<FeedSearch />);

    fireEvent.change(screen.getByLabelText("Buscar artículos"), { target: { value: "wooden " } });
    vi.advanceTimersByTime(400);
    expect(replace).toHaveBeenCalledWith("/feed?search=wooden");

    rerender(<FeedSearch initialSearch="wooden" />);

    expect(screen.getByLabelText("Buscar artículos")).toHaveValue("wooden ");
  });

  // Full repro from the regression: typing "wooden ", pausing past the debounce (which lands as
  // `initialSearch="wooden"` on rerender), then continuing to type "table" must produce
  // "wooden table", not "woodentable".
  it("does not concatenate further typing after its own debounced navigation lands", () => {
    vi.useFakeTimers();
    const { rerender } = render(<FeedSearch />);

    const input = screen.getByLabelText("Buscar artículos");
    fireEvent.change(input, { target: { value: "wooden " } });
    vi.advanceTimersByTime(400);
    expect(replace).toHaveBeenCalledWith("/feed?search=wooden");

    rerender(<FeedSearch initialSearch="wooden" />);

    fireEvent.change(input, { target: { value: "wooden table" } });

    expect(input).toHaveValue("wooden table");
  });

  // `lastSentSearch` only tells "my own navigation" apart from an external one while that
  // navigation is the latest URL change. Once the URL has moved on externally (e.g. the header
  // logo / "Inicio" tab links to bare `/feed`), going back to the term this field once sent is an
  // external change too, and the field must show it again instead of the stale value.
  it("re-syncs on back/forward to a term it sent itself before an external URL change", () => {
    vi.useFakeTimers();
    const { rerender } = render(<FeedSearch />);
    const input = screen.getByLabelText("Buscar artículos");

    fireEvent.change(input, { target: { value: "chair" } });
    vi.advanceTimersByTime(400);
    expect(replace).toHaveBeenCalledWith("/feed?search=chair");
    rerender(<FeedSearch initialSearch="chair" />);

    // External navigation to bare /feed (header logo / "Inicio" tab).
    rerender(<FeedSearch initialSearch={undefined} />);
    expect(input).toHaveValue("");

    // Browser back to /feed?search=chair.
    rerender(<FeedSearch initialSearch="chair" />);
    expect(input).toHaveValue("chair");
  });

  // Same swallow through a typed-but-different term: the URL lands on "chair" from outside while
  // the field shows something else, so it must re-sync to "chair".
  it("re-syncs when an external change lands on a term it sent earlier while showing another", () => {
    vi.useFakeTimers();
    const { rerender } = render(<FeedSearch category="furniture" />);
    const input = screen.getByLabelText("Buscar artículos");

    fireEvent.change(input, { target: { value: "chair" } });
    vi.advanceTimersByTime(400);
    rerender(<FeedSearch initialSearch="chair" category="furniture" />);

    // External: navigate to another URL with a different term (e.g. back to an older entry).
    rerender(<FeedSearch initialSearch="lamp" category="electronics" />);
    expect(input).toHaveValue("lamp");

    // External again: forward to /feed?category=furniture&search=chair.
    rerender(<FeedSearch initialSearch="chair" category="furniture" />);
    expect(input).toHaveValue("chair");
    vi.advanceTimersByTime(1000);
    // And the stale "lamp" must not be pushed back over the restored URL.
    expect(replace).toHaveBeenCalledTimes(1);
  });

  // The self-sent marker is one-shot: after an external round trip back to "chair", typing right
  // away must start a fresh debounce cycle whose own navigation keeps the trailing space again.
  it("starts a fresh debounce cycle right after an external return to a self-sent term", () => {
    vi.useFakeTimers();
    const { rerender } = render(<FeedSearch />);
    const input = screen.getByLabelText("Buscar artículos");

    fireEvent.change(input, { target: { value: "chair" } });
    vi.advanceTimersByTime(400);
    rerender(<FeedSearch initialSearch="chair" />);
    rerender(<FeedSearch initialSearch="lamp" />);
    rerender(<FeedSearch initialSearch="chair" />);
    expect(input).toHaveValue("chair");

    fireEvent.change(input, { target: { value: "chair " } });
    vi.advanceTimersByTime(400);
    // Only whitespace was added: the trimmed term is already in the URL, nothing to replace.
    expect(replace).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "chair red " } });
    vi.advanceTimersByTime(400);
    expect(replace).toHaveBeenLastCalledWith("/feed?search=chair+red");
    rerender(<FeedSearch initialSearch="chair red" />);

    expect(input).toHaveValue("chair red ");
  });

  // The user erases the field while its own navigation is still in flight: when that navigation
  // lands, the field must keep what the user has now ("") and send it, not jump back to "chair".
  it("keeps an erased field when its own earlier navigation lands late", () => {
    vi.useFakeTimers();
    const { rerender } = render(<FeedSearch />);
    const input = screen.getByLabelText("Buscar artículos");

    fireEvent.change(input, { target: { value: "chair" } });
    vi.advanceTimersByTime(400);
    fireEvent.change(input, { target: { value: "" } });
    rerender(<FeedSearch initialSearch="chair" />);

    expect(input).toHaveValue("");
    vi.advanceTimersByTime(400);
    expect(replace).toHaveBeenLastCalledWith("/feed");
  });

  it("keeps the active category when the search term changes", () => {
    vi.useFakeTimers();
    render(<FeedSearch category="furniture" />);

    fireEvent.change(screen.getByLabelText("Buscar artículos"), { target: { value: "lamp" } });
    vi.advanceTimersByTime(400);

    expect(replace).toHaveBeenCalledWith("/feed?category=furniture&search=lamp");
  });
});
