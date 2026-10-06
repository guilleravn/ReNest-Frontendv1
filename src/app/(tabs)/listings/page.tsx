import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { getListings } from "@/features/listings/api";
import { EmptyListings } from "@/features/listings/components/empty-listings";
import { ListingCard } from "@/features/listings/components/listing-card";
import { LISTING_STATUS_TABS, parseListingStatus } from "@/features/listings/listing-status";

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
  const activeStatus = parseListingStatus((await searchParams).status);
  const { data: listings } = await getListings(activeStatus);

  return (
    <>
      <h1 className="font-heading text-3xl max-sm:text-2xl">Lo que estás vendiendo</h1>
      <SegmentedTabs
        label="Estado de tus publicaciones"
        className="mt-4"
        tabs={LISTING_STATUS_TABS.map(({ status, label, href }) => ({
          label,
          href,
          isActive: status === activeStatus,
        }))}
      />
      {listings.length > 0 ? (
        <ul className="mt-6 grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ul>
      ) : (
        <EmptyListings status={activeStatus} />
      )}
    </>
  );
}
