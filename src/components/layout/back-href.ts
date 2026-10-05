/**
 * Where the header's back link goes from a detail page, matching the reference app: a
 * sub-step goes back to its item or purchase list, and a top-level detail goes to the feed.
 */
export function getBackHref(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const [section, id, step] = segments;

  // /items/:itemId/pickup, /items/:itemId/contact → the item.
  if (section === "items" && id && step) return `/items/${id}`;
  // /purchases/:purchaseId/recap → the purchase list.
  if (section === "purchases" && id) return "/purchases";
  // /purchases, /items/:itemId and anything unknown → the feed.
  return "/feed";
}
