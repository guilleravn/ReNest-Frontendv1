import Link from "next/link";

type SegmentedTab = {
  label: string;
  href: string;
  isActive: boolean;
};

type SegmentedTabsProps = {
  /** Accessible name of the group, e.g. "Estado de las compras". */
  label: string;
  tabs: readonly SegmentedTab[];
  className?: string;
};

/**
 * Full-width segmented control whose options are links, so the selected tab lives in the URL
 * (shareable, survives reloads) and the component stays a Server Component.
 */
export function SegmentedTabs({ label, tabs, className }: SegmentedTabsProps) {
  return (
    <nav
      aria-label={label}
      className={["border-border bg-surface flex rounded-lg border p-0.5 text-sm", className]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map(({ label: tabLabel, href, isActive }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={[
            "focus-visible:outline-ring flex-1 rounded-md px-3 py-2 text-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
            isActive
              ? "bg-background text-foreground shadow-card"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          {tabLabel}
        </Link>
      ))}
    </nav>
  );
}
