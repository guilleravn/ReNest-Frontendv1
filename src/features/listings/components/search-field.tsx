"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useReducer, useRef } from "react";

import { CloseIcon, SearchIcon } from "@/components/ui/icons";

import { MAX_SEARCH_QUERY_LENGTH, buildFeedSearchHref, parseSearchQuery } from "../feed-search";

/** Wait after the last keystroke before searching, so typing a word fires one request. */
export const SEARCH_DEBOUNCE_MS = 300;

type SearchFieldProps = {
  /** The search currently applied (from the URL), shown when the page loads. */
  defaultQuery: string;
};

type SearchFieldState = {
  /** What the input shows. */
  query: string;
  /** `?q=` as of the previous render, to notice when the URL's search changes. */
  previousDefaultQuery: string;
  /**
   * Searches this field asked for that haven't landed in the URL yet, oldest first. Tells the
   * field's own searches landing (even late, after a newer one was asked for) apart from a
   * navigation it didn't make.
   */
  pendingQueries: string[];
  /** Counts the `?q=` changes the field didn't make; a change cancels the pending debounce. */
  outsideChangeCount: number;
};

type SearchFieldAction =
  | { type: "typed"; query: string }
  | { type: "searchRequested"; query: string }
  | { type: "cleared" }
  | { type: "urlChanged"; defaultQuery: string };

function searchFieldReducer(state: SearchFieldState, action: SearchFieldAction): SearchFieldState {
  switch (action.type) {
    case "typed":
      return { ...state, query: action.query };
    case "searchRequested":
      return { ...state, pendingQueries: [...state.pendingQueries, action.query] };
    case "cleared":
      return { ...state, query: "", pendingQueries: [...state.pendingQueries, ""] };
    case "urlChanged": {
      const { defaultQuery } = action;
      const landedIndex = state.pendingQueries.indexOf(defaultQuery);
      // The field's own search landed: drop it and every older request (they were superseded),
      // and leave the input alone: the user may still be typing, or asked for a newer search.
      if (landedIndex !== -1) {
        return {
          ...state,
          previousDefaultQuery: defaultQuery,
          pendingQueries: state.pendingQueries.slice(landedIndex + 1),
        };
      }
      // A navigation the field didn't make (home link, back/forward): show its search.
      return {
        query: defaultQuery,
        previousDefaultQuery: defaultQuery,
        pendingQueries: [],
        outsideChangeCount: state.outsideChangeCount + 1,
      };
    }
    default: {
      const unhandled: never = action;
      throw new Error(`Unhandled search field action: ${JSON.stringify(unhandled)}`);
    }
  }
}

function initSearchFieldState(defaultQuery: string): SearchFieldState {
  return {
    query: defaultQuery,
    previousDefaultQuery: defaultQuery,
    pendingQueries: [],
    outsideChangeCount: 0,
  };
}

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
  // The URL's params as of the last commit, read when a (possibly debounced) search is applied,
  // so a param changed while the timer was pending isn't overwritten with a stale copy.
  const searchParamsRef = useRef(searchParams);
  const [state, dispatch] = useReducer(searchFieldReducer, defaultQuery, initSearchFieldState);
  const { query, outsideChangeCount } = state;

  // Adjust state during render (react.dev "You Might Not Need an Effect"): follow `?q=` when it
  // changes, telling the field's own searches apart from outside navigations (see the reducer).
  if (defaultQuery !== state.previousDefaultQuery) {
    dispatch({ type: "urlChanged", defaultQuery });
  }

  useLayoutEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // A navigation the field didn't make replaces what was being typed: a search still waiting on
  // the debounce must not fire afterwards and bring the abandoned text back. A layout effect, so
  // the timer is cancelled as soon as the change is on screen, before it can fire.
  useLayoutEffect(() => {
    if (outsideChangeCount > 0) clearTimeout(timerRef.current);
  }, [outsideChangeCount]);

  // A pending search must not fire (and navigate back to the feed) after the user has left it.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  function applySearch(nextQuery: string) {
    clearTimeout(timerRef.current);
    router.replace(buildFeedSearchHref(searchParamsRef.current, nextQuery), { scroll: false });
  }

  function requestSearch(nextQuery: string) {
    dispatch({ type: "searchRequested", query: parseSearchQuery(nextQuery) });
    applySearch(nextQuery);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    dispatch({ type: "typed", query: nextQuery });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => requestSearch(nextQuery), SEARCH_DEBOUNCE_MS);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    requestSearch(query);
  }

  function handleClearClick() {
    dispatch({ type: "cleared" });
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
