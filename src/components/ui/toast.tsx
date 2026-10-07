"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { CircleCheckIcon, CloseIcon } from "./icons";

type ToastProps = {
  /** The message to show, or `null` for none. */
  message: string | null;
  onDismiss: () => void;
  /** Auto-dismiss delay; paused while the pointer or focus is on the toast. */
  durationMs?: number;
};

/**
 * Non-urgent confirmation at the bottom of the screen. The live region is always mounted, so
 * screen readers announce a message when it appears; render this once and change `message`.
 */
export function Toast({ message, onDismiss, durationMs = 4000 }: ToastProps) {
  const [isPaused, setIsPaused] = useState(false);
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!message || isPaused) return;
    const timeoutId = window.setTimeout(() => dismiss(), durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [message, isPaused, durationMs]);

  function handleDismissClick() {
    // The toast unmounts with focus or the pointer on it, so no blur/leave will unpause it.
    setIsPaused(false);
    onDismiss();
  }

  return (
    <div
      role="status"
      aria-live="polite"
      // Clears the bottom tab bar on phones.
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 max-sm:bottom-24"
    >
      {message && (
        <div
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          className="border-border-strong bg-surface shadow-sheet pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg border py-2 pr-2 pl-4 transition-[opacity,translate] duration-200 motion-reduce:transition-none starting:translate-y-2 starting:opacity-0"
        >
          <CircleCheckIcon className="text-success size-5 shrink-0" />
          <p className="text-foreground min-w-0 flex-1 text-sm font-medium">{message}</p>
          <button
            type="button"
            onClick={handleDismissClick}
            aria-label="Cerrar aviso"
            className="text-muted hover:bg-surface-sunken hover:text-foreground focus-visible:outline-ring grid size-9 shrink-0 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
