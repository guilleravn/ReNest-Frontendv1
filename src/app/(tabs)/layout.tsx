import { AppHeader } from "@/components/layout/app-header";
import { TabNav } from "@/components/layout/tab-nav";

/** Shell for the top-level sections reachable from the tab navigation (/feed, /listings). */
export default function TabsLayout({ children }: LayoutProps<"/">) {
  // TODO(api): pass scheduledPurchasesCount, listingsInProgressCount and userInitial once the
  // backend exposes them (see docs/architecture.md, open questions). Until then no badge shows.
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <TabNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 pb-12 max-sm:px-4 max-sm:py-6 max-sm:pb-24">
        {children}
      </main>
    </div>
  );
}
