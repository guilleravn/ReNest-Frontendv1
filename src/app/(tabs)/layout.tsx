import { AppHeader } from "@/components/layout/app-header";
import { FlashToast } from "@/components/layout/flash-toast";
import { TabNav } from "@/components/layout/tab-nav";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { requireSession } from "@/lib/auth/session";
import { readFlash } from "@/lib/flash/flash";

/** Shell for the top-level sections reachable from the tab navigation (/feed, /listings). */
export default async function TabsLayout({ children }: LayoutProps<"/">) {
  const [user, flashMessage] = await Promise.all([requireSession(), readFlash()]);

  // TODO(api): pass scheduledPurchasesCount and listingsInProgressCount once the backend
  // exposes them (see docs/architecture.md, open questions). Until then no badge shows.
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader accountMenu={<AccountMenu fullName={user.fullName} email={user.email} />} />
      <TabNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 pb-12 max-sm:px-4 max-sm:py-6 max-sm:pb-24">
        {children}
      </main>
      <FlashToast message={flashMessage} />
    </div>
  );
}
