/**
 * Order, labels and default follow the reference app (renestapp.vercel.app/listings): sales in
 * progress come first because they are what needs the seller's attention.
 */
export const LISTING_STATUS_TABS = [
  { status: "PENDING", label: "En proceso", href: "/listings" },
  { status: "ACTIVE", label: "Activos", href: "/listings?status=ACTIVE" },
  { status: "COMPLETED", label: "Completados", href: "/listings?status=COMPLETED" },
] as const;

export type ListingStatusTab = (typeof LISTING_STATUS_TABS)[number]["status"];

/** Label of the status chip on each listing card. */
export const LISTING_STATUS_LABELS: Record<ListingStatusTab, string> = {
  PENDING: "Venta en proceso",
  ACTIVE: "Activo",
  COMPLETED: "Completado",
};

/** Reads `?status=` from the URL; anything missing or unknown falls back to "PENDING". */
export function parseListingStatus(value: string | string[] | undefined): ListingStatusTab {
  return value === "ACTIVE" || value === "COMPLETED" ? value : "PENDING";
}
