import { AppHeader } from "@/components/layout/app-header";

/** Shell for secondary pages: bordered header with a mobile back link, no tab navigation. */
export default function MainLayout({ children }: LayoutProps<"/">) {
  // TODO: pass purchasesCount from the backend once those endpoints exist.
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader bordered backHref="/feed" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-12 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
