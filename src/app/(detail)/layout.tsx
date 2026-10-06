import { AppHeader } from "@/components/layout/app-header";

/** Shell for detail pages (purchases, item detail and its steps): back link, no tab navigation. */
export default function DetailLayout({ children }: LayoutProps<"/">) {
  // TODO(api): pass scheduledPurchasesCount and userInitial once the backend exposes them.
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader isDetail />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 pb-12 max-sm:px-4 max-sm:py-6">
        {children}
      </main>
    </div>
  );
}
