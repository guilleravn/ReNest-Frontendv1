"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronBackIcon } from "@/components/ui/icons";

import { getBackHref } from "./back-href";

/** Phone-only back link in the header of detail pages; desktop uses the logo instead. */
export function BackLink() {
  const pathname = usePathname();

  return (
    <Link
      href={getBackHref(pathname)}
      aria-label="Volver"
      className="text-muted hover:bg-surface hover:text-foreground focus-visible:outline-ring -ml-2 hidden size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 max-sm:inline-flex"
    >
      <ChevronBackIcon className="size-5" />
    </Link>
  );
}
