"use client";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  /** Never shown: in production a Server Component error only carries a generic message. */
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the failed segment. */
  retry: () => void;
};

/**
 * Error boundary for everything under the root layout, including the `(tabs)` and `(detail)`
 * layouts, which call `GET /auth/me` on every render. It doesn't cover the root layout itself
 * (that would need `global-error.tsx`).
 */
export default function ErrorPage({ retry }: ErrorPageProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 max-sm:px-4 max-sm:py-8">
      <div
        role="alert"
        className="border-border bg-surface shadow-card flex w-full max-w-md flex-col items-center gap-3 rounded-xl border p-8 text-center max-sm:p-5"
      >
        <h1 className="font-heading text-3xl max-sm:text-2xl">Algo salió mal</h1>
        <p className="text-muted text-sm">
          No pudimos cargar esta página. Intenta de nuevo en unos segundos.
        </p>
        <Button onClick={() => retry()} className="mt-3">
          Reintentar
        </Button>
      </div>
    </main>
  );
}
