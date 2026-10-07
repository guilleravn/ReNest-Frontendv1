"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 400;
const SEARCH_MAX_LENGTH = 100;

type FeedSearchProps = {
  /** The `?search=` term currently in the URL; also used to re-sync the field (see below). */
  initialSearch?: string;
  /** The `?category=` already in the URL, kept when the search term changes the URL. */
  category?: string;
  className?: string;
};

/**
 * The feed's search box. The only Client Component in this slice: everything else stays a Server
 * Component reading `searchParams` (see data-fetching.md). Debounces typing by `DEBOUNCE_MS` and
 * then replaces the URL's `?search=` param, which re-triggers the page's data fetch; `category`
 * is carried over unchanged so searching never drops the active category filter.
 */
export function FeedSearch({ initialSearch = "", category, className }: FeedSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const [search, setSearch] = useState(initialSearch);
  // Re-sync the field when `search` changes in the URL for a reason other than this component's
  // own debounce (browser back/forward, a category chip click that also touches `search`, etc.):
  // the "adjust state during render when a prop changes" pattern, since a one-time `useState`
  // seed would otherwise leave the field showing a stale term forever (e.g. after going back).
  const [syncedSearch, setSyncedSearch] = useState(initialSearch);
  // The trimmed value this component itself last sent via `router.replace`, if any. When the
  // Server Component re-renders after that navigation, `initialSearch` changes to match it —
  // that's not an external change (back/forward, a category chip click) and must not overwrite
  // in-progress typing (e.g. a trailing space the user hasn't finished past yet). Kept in state
  // (not a ref) since it must be read during render, alongside `syncedSearch`. It's a one-shot
  // marker: it only applies to the single next `initialSearch` change right after a self-send, so
  // it's cleared below every time `initialSearch` changes, whether or not it matched. Otherwise a
  // later, genuinely external navigation that happens to land back on that same term (e.g.
  // pressing Back to a term typed earlier) would be wrongly treated as self-caused and skipped.
  const [lastSentSearch, setLastSentSearch] = useState<string | null>(null);
  if (initialSearch !== syncedSearch) {
    setSyncedSearch(initialSearch);
    if (initialSearch !== lastSentSearch) {
      setSearch(initialSearch);
    }
    setLastSentSearch(null);
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = search.trim();
      // The URL already reflects this value (nothing left to replace), whether because the user
      // hasn't typed anything new since the last navigation, or because something else (a
      // category click, browser back/forward) already moved the URL on. Firing `router.replace`
      // here — e.g. a timer left over from before that navigation — would otherwise silently
      // stomp whatever the user/navigation did in the meantime. This check, not "did the user
      // just mount/type", is what makes a stale timer a no-op instead of an overwrite.
      if (trimmed === (initialSearch ?? "")) return;

      setLastSentSearch(trimmed);

      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (trimmed) params.set("search", trimmed);

      const query = params.toString();
      router.replace(query ? `/feed?${query}` : "/feed");
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [search, category, initialSearch, router]);

  return (
    <div className={className}>
      <label htmlFor={inputId} className="sr-only">
        Buscar artículos
      </label>
      <input
        id={inputId}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar artículos..."
        maxLength={SEARCH_MAX_LENGTH}
        className="border-border bg-surface text-foreground placeholder:text-subtle focus-visible:outline-ring w-full max-w-sm rounded-lg border px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 max-sm:max-w-none"
      />
    </div>
  );
}
