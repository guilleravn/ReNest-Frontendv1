import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { PURCHASE_STATUS_TABS, parsePurchaseStatus } from "@/features/purchases/purchase-status";

export default async function PurchasesPage({ searchParams }: PageProps<"/purchases">) {
  const activeStatus = parsePurchaseStatus((await searchParams).status);

  return (
    <>
      <h1 className="font-heading text-3xl max-sm:text-2xl">Recogidas y compras</h1>
      <SegmentedTabs
        label="Estado de las compras"
        className="mt-4"
        tabs={PURCHASE_STATUS_TABS.map(({ status, label, href }) => ({
          label,
          href,
          isActive: status === activeStatus,
        }))}
      />
      {/* TODO(Epic 3): list the buyer's purchases for activeStatus, with empty/error states. */}
    </>
  );
}
