"use client";

import { catchError, type ErrorInfo } from "next/error";

import { ErrorState } from "./error-state";

type ErrorBoundaryProps = {
  /** What failed, in user terms: Server Component errors reach the client without details. */
  message: string;
};

function ErrorBoundaryFallback({ message }: ErrorBoundaryProps, { retry }: ErrorInfo) {
  return <ErrorState message={message} onRetry={retry} />;
}

/**
 * Error boundary for one part of a page (Next's `catchError`), so a failing section shows
 * `ErrorState` in place while the rest of the page stays usable. "Reintentar" re-fetches the
 * page's server data and re-renders the section (`router.refresh()` + reset, in a transition).
 *
 * Next only clears the error when the pathname changes. When the section depends on the search
 * params, give the boundary a `key` built from them, so a new search starts without the error.
 * Put it outside the section's `<Suspense>`.
 */
export const ErrorBoundary = catchError(ErrorBoundaryFallback);
