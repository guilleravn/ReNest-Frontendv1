"use client";

import { ErrorState } from "@/components/ui/error-state";

type ListingsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Error state for /listings and its nested segments. Server Component errors reach the client
 * without their message or status in production, so the copy stays generic and never shows
 * `error.message`.
 */
export default function ListingsError({ retry }: ListingsErrorProps) {
  return (
    <ErrorState
      message="No pudimos cargar tus publicaciones. Revisa tu conexión e inténtalo de nuevo."
      onRetry={retry}
    />
  );
}
