"use client";

import { startTransition, useEffect, useState } from "react";

import { Toast } from "@/components/ui/toast";
import { clearFlashAction } from "@/lib/flash/actions";

type FlashToastProps = {
  /** The pending flash message read on the server (`readFlash()`), or `null`. */
  message: string | null;
};

/**
 * Shows a one-time flash message once. On mount it clears the flash cookie through a Server
 * Action (Server Components can't delete cookies). That action refreshes the route and this
 * prop turns `null`, so the message lives in local state from then on.
 */
export function FlashToast({ message }: FlashToastProps) {
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    startTransition(async () => {
      await clearFlashAction();
    });
    // Filled after mount, into the already-mounted live region, so screen readers announce it.
    const timeoutId = window.setTimeout(() => setVisibleMessage(message), 0);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  return <Toast message={visibleMessage} onDismiss={() => setVisibleMessage(null)} />;
}
