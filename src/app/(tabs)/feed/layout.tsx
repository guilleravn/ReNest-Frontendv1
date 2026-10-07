/**
 * Shared by the feed page and its `error.tsx`, so the page heading stays on screen even when the
 * whole page fails.
 */
export default function FeedLayout({ children }: LayoutProps<"/feed">) {
  return (
    <>
      <h1 className="font-heading text-3xl max-sm:text-2xl">Encuentra algo con historia</h1>
      {children}
    </>
  );
}
