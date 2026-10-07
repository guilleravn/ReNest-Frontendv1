const PLACEHOLDER_ROWS = 3;

/** Loading state for the listings list: same grid and row size as `ListingCard`, no layout shift. */
export function ListingsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="mt-6">
      <span className="sr-only">Cargando tus publicaciones…</span>
      <ul
        aria-hidden="true"
        className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
      >
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
          <li
            key={index}
            className="border-border bg-surface flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="bg-surface-sunken size-16 shrink-0 rounded-md motion-safe:animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="bg-surface-sunken h-4 w-3/4 rounded-sm motion-safe:animate-pulse" />
              <div className="bg-surface-sunken h-4 w-1/4 rounded-sm motion-safe:animate-pulse" />
              <div className="bg-surface-sunken h-4 w-1/5 rounded-sm motion-safe:animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
