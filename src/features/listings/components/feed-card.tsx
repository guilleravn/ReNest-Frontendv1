import Image from "next/image";
import Link from "next/link";

import { PriceTagsIcon } from "@/components/layout/icons";

import { isRenderablePhotoUrl } from "../photo-url";
import { formatPriceCents } from "../price";
import type { FeedListing } from "../schemas";

type FeedCardProps = {
  listing: FeedListing;
};

/** A listing on the home feed, as in the reference app: photo, category, title and price. */
export function FeedCard({ listing }: FeedCardProps) {
  return (
    <li className="min-w-0">
      <Link
        href={`/items/${listing.id}`}
        className="group border-border bg-surface shadow-card hover:shadow-menu focus-visible:outline-ring flex h-full flex-col overflow-hidden rounded-xl border transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="bg-surface-sunken relative flex aspect-[4/3] items-center justify-center overflow-hidden">
          {isRenderablePhotoUrl(listing.photoUrl) ? (
            // Decorative: the title right below already names the listing.
            <Image
              src={listing.photoUrl}
              alt=""
              fill
              sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 24rem"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          ) : (
            <PriceTagsIcon className="text-subtle size-10" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <p className="text-subtle text-xs font-semibold tracking-wider uppercase">
            {listing.category.name}
          </p>
          <p className="text-foreground mt-1.5 line-clamp-2 text-sm font-semibold break-words">
            {listing.title}
          </p>
          <p className="text-price mt-1 text-lg font-semibold">
            {formatPriceCents(listing.priceCents)}
          </p>
        </div>
      </Link>
    </li>
  );
}
