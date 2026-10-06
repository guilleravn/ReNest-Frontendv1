export const PURCHASE_STATUS_TABS = [
  { status: "scheduled", label: "Agendadas", href: "/purchases" },
  { status: "completed", label: "Completadas", href: "/purchases?status=completed" },
] as const;

export type PurchaseStatusTab = (typeof PURCHASE_STATUS_TABS)[number]["status"];

/** Reads `?status=` from the URL; anything missing or unknown falls back to "scheduled". */
export function parsePurchaseStatus(value: string | string[] | undefined): PurchaseStatusTab {
  return value === "completed" ? "completed" : "scheduled";
}
