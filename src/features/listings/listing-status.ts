export const LISTING_STATUS_TABS = [
  { status: "ACTIVE", label: "Activos", href: "/listings" },
  { status: "PENDING", label: "Pendientes", href: "/listings?status=PENDING" },
  { status: "COMPLETED", label: "Completados", href: "/listings?status=COMPLETED" },
] as const;

export type ListingStatusTab = (typeof LISTING_STATUS_TABS)[number]["status"];

/** Reads `?status=` from the URL; anything missing or unknown falls back to "ACTIVE". */
export function parseListingStatus(value: string | string[] | undefined): ListingStatusTab {
  return value === "PENDING" || value === "COMPLETED" ? value : "ACTIVE";
}
