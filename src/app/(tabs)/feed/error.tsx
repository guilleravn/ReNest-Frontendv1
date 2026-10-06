"use client";

type FeedErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Error state for /feed. Server Component errors reach the client without their message or status
 * in production, so the copy stays generic and never shows `error.message`. The boundary replaces
 * the whole page, so it repeats the page heading to keep the screen identifiable.
 */
export default function FeedError({ retry }: FeedErrorProps) {
  return (
    <>
      <h1 className="font-heading text-3xl max-sm:text-2xl">Encuentra algo con historia</h1>
      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <p role="alert" className="text-foreground">
          No pudimos cargar los artículos. Revisa tu conexión e inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-ring rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Reintentar
        </button>
      </div>
    </>
  );
}
