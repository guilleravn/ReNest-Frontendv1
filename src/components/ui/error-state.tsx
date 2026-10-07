type ErrorStateProps = {
  /** What failed, in user terms. Never the raw `error.message` (it can leak backend details). */
  message: string;
  onRetry: () => void;
};

/**
 * Error state of a data view: the message in `role="alert"` and a retry button. Used by the
 * segments' `error.tsx` files and by `ErrorBoundary`.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 text-center">
      <p role="alert" className="text-foreground">
        {message}
      </p>
      <button
        type="button"
        onClick={() => onRetry()}
        className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-ring rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Reintentar
      </button>
    </div>
  );
}
