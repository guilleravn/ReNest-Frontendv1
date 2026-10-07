import Link from "next/link";

import { PackageSearchIcon } from "@/components/ui/icons";

import { FEED_EMPTY_MESSAGE, FEED_NO_MATCH_TITLE, getNoMatchHint } from "../feed-copy";

type EmptyFeedProps = {
  /** The applied search; `""` when the feed itself is empty. */
  query: string;
  /** Feed URL with the search removed and every other param kept (see `buildFeedSearchHref`). */
  clearSearchHref: string;
};

/**
 * Empty state of the home feed: a search with no matches (with a way back to the whole feed), or
 * no published listings at all. Not a live region: the feed page's persistent status region
 * announces the same message.
 */
export function EmptyFeed({ query, clearSearchHref }: EmptyFeedProps) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <PackageSearchIcon className="text-subtle mx-auto size-10" />
      {query ? (
        <>
          <p className="text-foreground mt-3 text-base font-semibold">{FEED_NO_MATCH_TITLE}</p>
          <p className="text-muted mt-1 text-sm break-words">{getNoMatchHint(query)}</p>
          <Link
            href={clearSearchHref}
            scroll={false}
            className="border-border-strong bg-surface text-foreground hover:border-primary focus-visible:outline-ring mt-5 inline-flex rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Limpiar búsqueda
          </Link>
        </>
      ) : (
        <p className="text-foreground mt-3 text-base font-semibold">{FEED_EMPTY_MESSAGE}</p>
      )}
    </div>
  );
}
