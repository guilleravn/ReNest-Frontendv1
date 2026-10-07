import Image from "next/image";
import Link from "next/link";

import { PriceTagsIcon } from "@/components/layout/icons";

import { isRenderablePhotoUrl } from "../photo-url";
import { formatPriceCents } from "../price";
import type { Listing } from "../schemas";

type FeedItemCardProps = {
  listing: Listing;
};

/** A card in the buyer feed grid: photo, title and price, linking to the item's detail page. */
export function FeedItemCard({ listing }: FeedItemCardProps) {
  return (
    <li className="min-w-0">
      <Link
        href={`/items/${listing.id}`}
        className="focus-visible:outline-ring border-border bg-surface hover:border-border-strong flex flex-col gap-2 rounded-lg border p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="bg-surface-sunken relative aspect-square overflow-hidden rounded-md">
          {isRenderablePhotoUrl(listing.photoUrl) ? (
            // Decorative: the title right below already names the listing.
            <Image
              src={listing.photoUrl}
              alt=""
              fill
              sizes="(max-width: 40rem) 50vw, (max-width: 64rem) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <PriceTagsIcon className="text-subtle size-8" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{listing.title}</p>
          <p className="text-foreground font-semibold">{formatPriceCents(listing.priceCents)}</p>
        </div>
      </Link>
    </li>
  );
}
