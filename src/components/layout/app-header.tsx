import Image from "next/image";
import Link from "next/link";

import { BackLink } from "./back-link";
import { CountBadge } from "./count-badge";
import { ShoppingBagIcon, UserIcon } from "./icons";

type AppHeaderProps = {
  /** The buyer's purchases with a scheduled pickup; undefined while unknown. */
  scheduledPurchasesCount?: number;
  /** First letter of the signed-in user's name; a generic icon while unknown. */
  userInitial?: string;
  /** Detail pages: bottom border and a phone-only back link instead of the tab navigation. */
  isDetail?: boolean;
};

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function AppHeader({
  scheduledPurchasesCount,
  userInitial,
  isDetail = false,
}: AppHeaderProps) {
  const hasScheduled = scheduledPurchasesCount !== undefined && scheduledPurchasesCount > 0;

  return (
    <header
      className={[
        "bg-background/85 sticky top-0 z-40 backdrop-blur-md",
        isDetail && "border-border border-b",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {isDetail && <BackLink />}

        <Link
          href="/feed"
          aria-label="Inicio de ReNest"
          className={`flex items-center rounded-lg ${FOCUS_RING}`}
        >
          {/* Two files because the brand colors differ per theme; CSS picks one. */}
          <Image
            src="/brand/logo-mono-white.svg"
            alt=""
            width={108}
            height={40}
            priority
            className="light:hidden h-10 w-auto max-sm:h-9"
          />
          <Image
            src="/brand/logo-horizontal.svg"
            alt=""
            width={108}
            height={40}
            priority
            className="light:block hidden h-10 w-auto max-sm:h-9"
          />
        </Link>

        <div className="flex-1" />

        <Link
          href="/purchases"
          aria-label={
            hasScheduled ? `Mis compras, ${scheduledPurchasesCount} agendadas` : "Mis compras"
          }
          className={`text-muted hover:bg-surface hover:text-foreground -mr-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${FOCUS_RING}`}
        >
          <span className="relative">
            <ShoppingBagIcon className="size-5" />
            <CountBadge count={scheduledPurchasesCount} className="absolute -top-1.5 -right-1.5" />
          </span>
          <span className="max-sm:hidden">Mis compras</span>
        </Link>

        {/* TODO(auth): turn into the account menu (logout) once the login flow exists. */}
        <span
          role="img"
          aria-label="Mi cuenta"
          className="border-border-strong bg-surface text-foreground ml-1 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold"
        >
          {userInitial ? (
            <span aria-hidden="true">{userInitial.toUpperCase()}</span>
          ) : (
            <UserIcon className="size-4" />
          )}
        </span>
      </div>
    </header>
  );
}
