"use client";

import { useEffect, useId, useRef, useState } from "react";

import { LogOutIcon } from "@/components/ui/icons";
import { logoutAction } from "@/features/auth/actions";

type AccountMenuProps = {
  fullName: string;
  email: string;
};

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * The avatar in the app header: a disclosure with the signed-in user and "Cerrar sesión".
 * Opening moves focus to the logout button; Escape closes it and returns focus to the avatar;
 * a click outside closes it.
 */
export function AccountMenu({ fullName, email }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const initial = fullName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) return;

    logoutButtonRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative ml-1 shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Mi cuenta"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        className={`border-border-strong bg-surface text-foreground hover:border-primary grid size-8 place-items-center rounded-full border text-xs font-semibold transition-colors ${FOCUS_RING}`}
      >
        <span aria-hidden="true">{initial}</span>
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="border-border bg-surface shadow-menu absolute top-full right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border p-2"
      >
        <div className="border-border flex flex-col gap-0.5 border-b px-2 pt-1 pb-2">
          <p className="text-foreground text-sm font-semibold wrap-anywhere">{fullName}</p>
          <p className="text-muted text-sm wrap-anywhere">{email}</p>
        </div>
        <form action={logoutAction} className="pt-1">
          <button
            ref={logoutButtonRef}
            type="submit"
            className={`text-foreground hover:bg-surface-sunken flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors ${FOCUS_RING}`}
          >
            <LogOutIcon className="text-muted size-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
