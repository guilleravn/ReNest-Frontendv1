import { FeedSkeleton } from "@/features/feed/components/feed-skeleton";

/**
 * Segment-level fallback for `/feed`. In practice the page itself resolves instantly (it only
 * awaits `searchParams`) and the real fetch happens inside `FeedContent`'s own `<Suspense>`, so
 * this mostly guards slow initial server renders; kept per convention (see
 * frontend-invariants.md's "UI states" section).
 */
export default function FeedLoading() {
  return <FeedSkeleton />;
}
