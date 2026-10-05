import { AppHeader } from "@/components/layout/app-header";
import { DesktopTabNav, MobileTabNav } from "@/components/layout/tab-nav";

/** Shell for the top-level sections reachable from the tab navigation (/feed, /listings). */
export default function TabsLayout({ children }: LayoutProps<"/">) {
  // TODO: pass purchasesCount/listingsCount from the backend once those endpoints exist.
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <DesktopTabNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-12">
        {children}
      </main>
      <MobileTabNav />
    </div>
  );
}
