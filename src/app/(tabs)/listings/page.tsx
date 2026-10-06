import { Suspense } from "react";

import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { ListingsResults } from "@/features/listings/components/listings-results";
import { ListingsSkeleton } from "@/features/listings/components/listings-skeleton";
import { LISTING_STATUS_TABS, parseListingStatus } from "@/features/listings/listing-status";

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
  const activeStatus = parseListingStatus((await searchParams).status);

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
      {/* Keyed by status so switching tabs shows the skeleton again instead of stale results. */}
      <Suspense key={activeStatus} fallback={<ListingsSkeleton />}>
        <ListingsResults status={activeStatus} />
      </Suspense>
    </>
  );
}
