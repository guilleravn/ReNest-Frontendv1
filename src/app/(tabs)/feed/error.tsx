"use client";

import { ErrorState } from "@/components/ui/error-state";
import { FEED_ERROR_MESSAGE } from "@/features/listings/feed-copy";

type FeedErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Last-resort error state for /feed. Search errors are caught in place by the page's own boundary
 * around the results; this one only shows when the page itself fails. The page heading lives in
 * the segment's layout, which stays visible above it.
 */
export default function FeedError({ retry }: FeedErrorProps) {
  return <ErrorState message={FEED_ERROR_MESSAGE} onRetry={retry} />;
}
