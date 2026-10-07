import Image from "next/image";
import Link from "next/link";

import { ChevronBackIcon, PriceTagsIcon } from "@/components/ui/icons";

import { LISTING_STATUS_LABELS } from "../listing-status";
import { isRenderablePhotoUrl } from "../photo-url";
import { formatPriceCents } from "../price";
import type { Listing } from "../schemas";

type ListingCardProps = {
  listing: Listing;
};

/**
 * A row in the seller's "My Listings" list, as in the reference app: thumbnail, title, price and
 * status, linking to the listing's own page. A sale in progress is highlighted, since it is what
 * needs the seller's attention.
 */
export function ListingCard({ listing }: ListingCardProps) {
  const isInProgress = listing.status === "PENDING";
  const statusLabel = LISTING_STATUS_LABELS[listing.status];

  return (
    <li className="min-w-0">
      <Link
        href={`/listings/${listing.id}`}
        className={[
          "focus-visible:outline-ring flex items-center gap-3 rounded-lg border p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
          isInProgress
            ? "border-primary bg-success-surface border-l-4"
            : "border-border bg-surface hover:border-border-strong",
        ].join(" ")}
      >
        <div className="bg-surface-sunken relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {isRenderablePhotoUrl(listing.photoUrl) ? (
            // Decorative: the title right next to it already names the listing.
            <Image src={listing.photoUrl} alt="" fill sizes="4rem" className="object-cover" />
          ) : (
            <PriceTagsIcon className="text-subtle size-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isInProgress ? (
            <p className="text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
              <span aria-hidden="true" className="bg-primary size-1.5 rounded-full" />
              {statusLabel}
            </p>
          ) : null}
          <p className="text-foreground truncate font-medium">{listing.title}</p>
          <p className="text-foreground font-semibold">{formatPriceCents(listing.priceCents)}</p>
          {isInProgress ? null : (
            <span className="bg-success-surface text-success mt-1 inline-block rounded-sm px-2 py-0.5 text-xs">
              {statusLabel}
            </span>
          )}
        </div>
        {isInProgress ? null : (
          <ChevronBackIcon className="text-subtle size-4 shrink-0 rotate-180" />
        )}
      </Link>
    </li>
  );
}
