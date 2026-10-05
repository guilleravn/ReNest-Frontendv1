import { SegmentedTabs } from "@/components/ui/segmented-tabs";

const TABS = [
  { value: "agendadas", label: "Agendadas" },
  { value: "completadas", label: "Completadas" },
] as const;

type PurchasesTab = (typeof TABS)[number]["value"];

function parseTab(value: string | string[] | undefined): PurchasesTab {
  return value === "completadas" ? "completadas" : "agendadas";
}

export default async function PurchasesPage({ searchParams }: PageProps<"/purchases">) {
  const activeTab = parseTab((await searchParams).tab);

  return (
    <>
      <h2 className="text-2xl">Recogidas y compras</h2>
      <SegmentedTabs
        label="Estado de las compras"
        className="mt-4"
        tabs={TABS.map(({ value, label }) => ({
          label,
          href: value === "agendadas" ? "/purchases" : `/purchases?tab=${value}`,
          active: value === activeTab,
        }))}
      />
      {/* TODO: list of pickups for the active tab. */}
    </>
  );
}
