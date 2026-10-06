import Image from "next/image";
import Link from "next/link";

import { PriceTagsIcon } from "@/components/layout/icons";

import { isRenderablePhotoUrl } from "../photo-url";
import { formatPriceCents } from "../price";
import type { Listing } from "../schemas";

type ListingCardProps = {
  listing: Listing;
};

/** A single listing in the seller's "My Listings" grid. Links to the listing's own page. */
export function ListingCard({ listing }: ListingCardProps) {
  return (
    <li className="border-border bg-surface shadow-card overflow-hidden rounded-lg border">
      <Link
        href={`/listings/${listing.id}`}
        className="focus-visible:outline-ring block focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="bg-surface-sunken relative flex aspect-square w-full items-center justify-center">
          {isRenderablePhotoUrl(listing.photoUrl) ? (
            <Image
              src={listing.photoUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 40rem) 50vw, (max-width: 64rem) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <PriceTagsIcon className="text-subtle size-10" />
          )}
        </div>
        <div className="p-3">
          <p className="text-foreground truncate font-medium">{listing.title}</p>
          <p className="text-price font-heading mt-1 text-lg">
            {formatPriceCents(listing.priceCents)}
          </p>
        </div>
      </Link>
    </li>
  );
}
