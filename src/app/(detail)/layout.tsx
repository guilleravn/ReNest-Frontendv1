import { AppHeader } from "@/components/layout/app-header";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { requireSession } from "@/lib/auth/session";

/** Shell for detail pages (purchases, item detail and its steps): back link, no tab navigation. */
export default async function DetailLayout({ children }: LayoutProps<"/">) {
  const user = await requireSession();

  // TODO(api): pass scheduledPurchasesCount once the backend exposes it.
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        isDetail
        accountMenu={<AccountMenu fullName={user.fullName} email={user.email} />}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 pb-12 max-sm:px-4 max-sm:py-6">
        {children}
      </main>
    </div>
  );
}
