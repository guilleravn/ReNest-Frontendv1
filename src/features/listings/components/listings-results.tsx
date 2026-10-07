import { getListings } from "../api";
import type { ListingStatusTab } from "../listing-status";
import { EmptyListings } from "./empty-listings";
import { ListingCard } from "./listing-card";

type ListingsResultsProps = {
  status: ListingStatusTab;
};

/**
 * Fetches and lists the seller's listings for one status. Errors are thrown on purpose and caught
 * by the segment's `error.tsx`.
 */
export async function ListingsResults({ status }: ListingsResultsProps) {
  const {
    data: listings,
    meta: { total },
  } = await getListings(status);

  if (listings.length === 0) return <EmptyListings status={status} />;

  return (
    <>
      <ul className="mt-6 grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </ul>
      {/* The backend returns one page of results and there is no pagination UI yet: say so
          instead of letting a truncated list look complete. */}
      {total > listings.length ? (
        <p className="text-muted mt-4 text-sm">
          Mostrando {listings.length} de {total} publicaciones.
        </p>
      ) : null}
    </>
  );
}
