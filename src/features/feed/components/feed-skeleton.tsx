const PLACEHOLDER_CHIPS = 4;
const PLACEHOLDER_ITEMS = 8;

/**
 * Loading state for the feed: a chip-row placeholder plus the same grid as `FeedItemCard`, so
 * there's no layout shift once the real chips and items arrive.
 */
export function FeedSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="mt-4">
      <span className="sr-only">Cargando artículos…</span>
      <div aria-hidden="true" className="flex flex-wrap gap-2">
        {Array.from({ length: PLACEHOLDER_CHIPS }, (_, index) => (
          <div
            key={index}
            className="bg-surface-sunken h-9 w-20 rounded-full motion-safe:animate-pulse"
          />
        ))}
      </div>
      <ul
        aria-hidden="true"
        className="mt-6 grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2"
      >
        {Array.from({ length: PLACEHOLDER_ITEMS }, (_, index) => (
          <li key={index} className="flex flex-col gap-2">
            <div className="bg-surface-sunken aspect-square rounded-md motion-safe:animate-pulse" />
            <div className="bg-surface-sunken h-4 w-3/4 rounded-sm motion-safe:animate-pulse" />
            <div className="bg-surface-sunken h-4 w-1/3 rounded-sm motion-safe:animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  );
}
