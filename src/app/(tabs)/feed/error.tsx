"use client";

type FeedErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Error state for /feed and its nested segments. Server Component errors reach the client
 * without their message or status in production, so the copy stays generic and never shows
 * `error.message`.
 */
export default function FeedError({ retry }: FeedErrorProps) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 text-center">
      <p role="alert" className="text-foreground">
        No pudimos cargar el feed. Revisa tu conexión e inténtalo de nuevo.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-ring rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Reintentar
      </button>
    </div>
  );
}
