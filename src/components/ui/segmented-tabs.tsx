import Link from "next/link";

import { cn } from "@/lib/cn";

export type SegmentedTab = {
  label: string;
  href: string;
  active: boolean;
};

type SegmentedTabsProps = {
  tabs: SegmentedTab[];
  /** Accessible name for the group, e.g. "Estado de las compras". */
  label: string;
  className?: string;
};

/**
 * Pill-style tab switcher whose state lives in the URL: each tab is a link and the page
 * decides which one is active (usually from `searchParams`).
 */
export function SegmentedTabs({ tabs, label, className }: SegmentedTabsProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "flex w-full rounded-lg border border-border bg-surface p-0.5 text-sm",
        className,
      )}
    >
      {tabs.map(({ label: tabLabel, href, active }) => (
        <Link
          key={href}
          href={href}
          replace
          scroll={false}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            active
              ? "bg-background text-foreground shadow-[var(--shadow-card)]"
              : "text-text-muted hover:text-foreground",
          )}
        >
          {tabLabel}
        </Link>
      ))}
    </nav>
  );
}
