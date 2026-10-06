"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CountBadge } from "./count-badge";
import { HouseIcon, PriceTagsIcon } from "./icons";

type TabNavProps = {
  /** The seller's listings with a sale in progress; undefined while unknown. */
  listingsInProgressCount?: number;
};

const TABS = [
  { href: "/feed", label: "Inicio", Icon: HouseIcon },
  { href: "/listings", label: "Mis artículos", Icon: PriceTagsIcon },
] as const;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * Main navigation between the two top-level sections. Desktop shows a segmented bar under
 * the header; phones get a bottom bar fixed to the viewport. Only one is displayed at a time,
 * so assistive tech sees a single nav.
 */
export function TabNav({ listingsInProgressCount }: TabNavProps) {
  const pathname = usePathname();

  const tabs = TABS.map((tab) => {
    const count = tab.href === "/listings" ? listingsInProgressCount : undefined;
    const hasCount = count !== undefined && count > 0;

    return {
      ...tab,
      count,
      isActive: pathname === tab.href || pathname.startsWith(`${tab.href}/`),
      accessibleName: hasCount ? `${tab.label}, ${count} en proceso` : undefined,
    };
  });

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pb-2 max-sm:hidden">
        <nav
          aria-label="Principal"
          className="border-border bg-surface flex rounded-lg border p-0.5"
        >
          {tabs.map(({ href, label, Icon, count, isActive, accessibleName }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              aria-label={accessibleName}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                FOCUS_RING,
                isActive
                  ? "bg-background text-foreground shadow-card"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {label}
              <CountBadge count={count} />
            </Link>
          ))}
        </nav>
      </div>

      <nav
        aria-label="Principal"
        className="border-border bg-background/90 fixed inset-x-0 bottom-0 z-40 hidden border-t backdrop-blur-md max-sm:block"
      >
        <ul className="mx-auto flex max-w-md">
          {tabs.map(({ href, label, Icon, count, isActive, accessibleName }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                aria-label={accessibleName}
                className={[
                  "flex flex-col items-center gap-0.5 py-2.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] text-[0.7rem] font-medium transition-colors",
                  FOCUS_RING,
                  isActive ? "text-primary" : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  <CountBadge count={count} className="absolute -top-1.5 -right-2.5" />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
