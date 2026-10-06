import Link from "next/link";

type ChipTab = {
  label: string;
  href: string;
  isActive: boolean;
};

type ChipTabsProps = {
  /** Accessible name of the group, e.g. "Estado de tus publicaciones". */
  label: string;
  tabs: readonly ChipTab[];
  className?: string;
};

/**
 * Row of pill-shaped filter chips (as on the reference app's "Mis artículos" screen) whose
 * options are links, so the selected tab lives in the URL and the component stays a Server
 * Component. Same contract as `SegmentedTabs`; the chips wrap instead of overflowing.
 */
export function ChipTabs({ label, tabs, className }: ChipTabsProps) {
  return (
    <nav
      aria-label={label}
      className={["flex flex-wrap gap-2 text-sm", className].filter(Boolean).join(" ")}
    >
      {tabs.map(({ label: tabLabel, href, isActive }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={[
            "focus-visible:outline-ring rounded-full border px-4 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
            isActive
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border-strong bg-surface text-foreground hover:border-primary",
          ].join(" ")}
        >
          {tabLabel}
        </Link>
      ))}
    </nav>
  );
}
