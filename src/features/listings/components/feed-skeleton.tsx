import { FEED_GRID_CLASS_NAME } from "./feed-grid";

const PLACEHOLDER_CARDS = 6;

/**
 * Loading state for the feed: same count line, grid and card size as `FeedResults`. Purely
 * visual: the page's persistent status region announces "Cargando artículos…".
 */
export function FeedSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="bg-surface-sunken mt-5 h-4 w-24 rounded-sm motion-safe:animate-pulse" />
      <ul className={`mt-3 ${FEED_GRID_CLASS_NAME}`}>
        {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
          <li key={index} className="border-border bg-surface overflow-hidden rounded-xl border">
            <div className="bg-surface-sunken aspect-[4/3] motion-safe:animate-pulse" />
            <div className="space-y-2 p-3">
              <div className="bg-surface-sunken h-3 w-1/4 rounded-sm motion-safe:animate-pulse" />
              <div className="bg-surface-sunken h-4 w-3/4 rounded-sm motion-safe:animate-pulse" />
              <div className="bg-surface-sunken h-6 w-1/5 rounded-sm motion-safe:animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
