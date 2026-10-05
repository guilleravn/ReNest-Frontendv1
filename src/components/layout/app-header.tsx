import { ChevronLeft, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

import { CountBadge } from "./count-badge";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type AppHeaderProps = {
  /** Scheduled pickups shown as a badge on "Mis compras". No badge when 0. */
  purchasesCount?: number;
  /** Bottom border, used on pages without the tab navigation. */
  bordered?: boolean;
  /** Shows a mobile-only back link to this href. */
  backHref?: string;
};

export function AppHeader({ purchasesCount = 0, bordered = false, backHref }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/85 backdrop-blur-md",
        bordered && "border-b border-border",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Volver"
            className={cn(
              "-ml-2 inline-flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-muted hover:text-foreground sm:hidden",
              focusRing,
            )}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Link>
        )}

        <Link
          href="/feed"
          aria-label="Inicio de ReNest"
          className={cn("flex items-center rounded-lg", focusRing)}
        >
          <Image
            src="/brand/logo-mono-white.svg"
            alt="ReNest"
            width={108}
            height={40}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <div className="flex-1" />

        <Link
          href="/purchases"
          aria-label={
            purchasesCount > 0 ? `Mis compras, ${purchasesCount} agendadas` : "Mis compras"
          }
          className={cn(
            "relative -mr-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-muted hover:text-foreground",
            focusRing,
          )}
        >
          <span className="relative">
            <ShoppingBag className="size-5" aria-hidden="true" />
            <CountBadge count={purchasesCount} className="absolute -top-1.5 -right-1.5" />
          </span>
          <span className="hidden sm:inline">Mis compras</span>
        </Link>

        {/* TODO: account menu (dropdown) and the user's initial once auth exists. */}
        <button
          type="button"
          aria-label="Mi cuenta"
          className={cn("ml-1 rounded-full transition-opacity hover:opacity-90", focusRing)}
        >
          <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            <User className="size-4" aria-hidden="true" />
          </span>
        </button>
      </div>
    </header>
  );
}
