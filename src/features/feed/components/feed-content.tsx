import { ChipTabs } from "@/components/ui/chip-tabs";

import { getCategories, getFeed } from "../api";
import { buildCategoryHref } from "../feed-filters";
import { EmptyFeed } from "./empty-feed";
import { FeedItemCard } from "./feed-item-card";

type FeedContentProps = {
  category?: string;
  search?: string;
};

/**
 * Fetches categories and listings together (independent requests, see data-fetching.md) and
 * renders the category chips plus the result grid for the current filters. Kept as one piece,
 * re-fetched together under the page's `<Suspense key={category:search}>`, so a category click
 * always shows a consistent chip row + grid pair instead of chips and results settling at
 * different times. Errors are thrown on purpose and caught by the segment's `error.tsx`.
 */
export async function FeedContent({ category, search }: FeedContentProps) {
  const [{ data: categories }, feed] = await Promise.all([
    getCategories(),
    getFeed({ category, search }),
  ]);
  const {
    data: listings,
    meta: { total },
  } = feed;

  return (
    <>
      <ChipTabs
        label="Categorías"
        className="mt-4"
        tabs={categories.map((cat) => ({
          label: cat.name,
          href: buildCategoryHref(cat.slug, category, search),
          isActive: cat.slug === category,
        }))}
      />
      {listings.length === 0 ? (
        <EmptyFeed hasCategory={Boolean(category)} hasSearch={Boolean(search)} />
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2">
            {listings.map((listing) => (
              <FeedItemCard key={listing.id} listing={listing} />
            ))}
          </ul>
          {/* The backend returns one page of results and there is no pagination UI yet: say so
              instead of letting a truncated grid look complete. */}
          {total > listings.length ? (
            <p className="text-muted mt-4 text-sm">
              Mostrando {listings.length} de {total} artículos.
            </p>
          ) : null}
        </>
      )}
    </>
  );
}
