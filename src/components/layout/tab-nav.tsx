"use client";

import { House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { CountBadge } from "./count-badge";
import { PriceTagsIcon } from "./icons";

type TabNavProps = {
  /** Listings in progress shown as a badge on "Mis artículos". No badge when 0. */
  listingsCount?: number;
};

function useTabs({ listingsCount = 0 }: TabNavProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return [
    { href: "/feed", label: "Inicio", Icon: HouseIcon, count: 0, active: isActive("/feed") },
    {
      href: "/listings",
      label: "Mis artículos",
      Icon: PriceTagsIcon,
      count: listingsCount,
      active: isActive("/listings"),
    },
  ];
}

function HouseIcon({ className }: { className?: string }) {
  return <House className={className} strokeWidth={2.4} aria-hidden="true" />;
}

/** Segmented tab bar under the header. Desktop (sm and up) only. */
export function DesktopTabNav(props: TabNavProps) {
  const tabs = useTabs(props);

  return (
    <div className="bg-background">
      <div className="mx-auto hidden max-w-6xl px-4 pb-2 sm:block">
        <nav
          aria-label="Principal"
          className="flex w-full rounded-lg border border-border bg-surface p-0.5"
        >
          {tabs.map(({ href, label, Icon, count, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-[var(--shadow-card)]"
                  : "text-text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
              <CountBadge count={count} />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

/** Bottom tab bar fixed to the viewport. Mobile (below sm) only. */
export function MobileTabNav(props: TabNavProps) {
  const tabs = useTabs(props);

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md sm:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map(({ href, label, Icon, count, active }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] text-[0.7rem] font-medium transition-colors",
                active ? "text-green-strong" : "text-text-muted hover:text-foreground",
              )}
            >
              <span className="relative">
                <Icon className="size-5" />
                <CountBadge count={count} className="absolute -top-1.5 -right-2.5 text-[0.6rem]" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
