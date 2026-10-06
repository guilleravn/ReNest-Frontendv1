"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { MAX_SEARCH_QUERY_LENGTH, buildFeedSearchHref, parseSearchQuery } from "../feed-search";

/** Wait after the last keystroke before searching, so typing a word fires one request. */
export const SEARCH_DEBOUNCE_MS = 300;

type SearchFieldProps = {
  /** The search currently applied (from the URL), shown when the page loads. */
  defaultQuery: string;
};

/**
 * Title search for the home feed. The query lives in the URL (`?q=`): the page re-renders on the
 * server with the new results, and the input is a controlled mirror of what is being typed.
 */
export function SearchField({ defaultQuery }: SearchFieldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [query, setQuery] = useState(defaultQuery);
  // `?q=` as of the previous render, to notice when the URL's search changes.
  const [previousDefaultQuery, setPreviousDefaultQuery] = useState(defaultQuery);
  // The `?q=` this field expects next: the search it last asked for, or the one it last synced
  // from the URL. Tells the field's own search landing apart from an outside navigation.
  const [expectedQuery, setExpectedQuery] = useState(defaultQuery);

  // Adjust state during render (react.dev "You Might Not Need an Effect"): when `?q=` changes
  // because of a navigation this field didn't make (home link, back/forward), show it. When it is
  // the field's own search landing, leave the input alone: the user may still be typing.
  if (defaultQuery !== previousDefaultQuery) {
    setPreviousDefaultQuery(defaultQuery);
    if (defaultQuery !== expectedQuery) {
      setExpectedQuery(defaultQuery);
      setQuery(defaultQuery);
    }
  }

  // A pending search must not fire (and navigate back to the feed) after the user has left it.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  function applySearch(nextQuery: string) {
    clearTimeout(timerRef.current);
    setExpectedQuery(parseSearchQuery(nextQuery));
    router.replace(buildFeedSearchHref(searchParams, nextQuery), { scroll: false });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => applySearch(nextQuery), SEARCH_DEBOUNCE_MS);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch(query);
  }

  function handleClearClick() {
    setQuery("");
    applySearch("");
    // The clear button disappears with the text: keep focus in the field instead of losing it.
    inputRef.current?.focus();
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative">
      <label htmlFor={inputId} className="sr-only">
        Buscar por título
      </label>
      <SearchIcon className="text-subtle pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={query}
        onChange={handleChange}
        maxLength={MAX_SEARCH_QUERY_LENGTH}
        placeholder="Buscar por título"
        autoComplete="off"
        enterKeyHint="search"
        className="border-border-strong bg-background text-foreground placeholder:text-subtle focus-visible:border-primary focus-visible:outline-ring h-12 w-full min-w-0 rounded-xl border-[1.5px] pr-11 pl-10 text-base focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {query ? (
        <button
          type="button"
          onClick={handleClearClick}
          aria-label="Limpiar búsqueda"
          className="text-muted hover:text-foreground focus-visible:outline-ring absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <CloseIcon className="size-4" />
        </button>
      ) : null}
    </form>
  );
}

// Inline copies of Lucide's search and x icons, as in the reference app. Decorative.
function SearchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

function CloseIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
