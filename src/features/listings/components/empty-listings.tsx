import type { ListingStatusTab } from "../listing-status";

type EmptyListingsProps = {
  status: ListingStatusTab;
};

/** Status-specific copy for when a seller has no listings in the selected tab. */
const EMPTY_COPY: Record<ListingStatusTab, string> = {
  ACTIVE: "No tienes publicaciones activas todavía.",
  PENDING: "No tienes publicaciones pendientes de entrega.",
  COMPLETED: "Aún no tienes ventas completadas.",
};

export function EmptyListings({ status }: EmptyListingsProps) {
  return (
    <p className="text-muted mt-8 text-center text-sm" role="status">
      {EMPTY_COPY[status]}
    </p>
  );
}
