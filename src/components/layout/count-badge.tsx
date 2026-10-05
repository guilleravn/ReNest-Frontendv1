type CountBadgeProps = {
  /** Undefined while the value is unknown (e.g. not fetched yet): nothing is shown. */
  count?: number;
  className?: string;
};

/**
 * Small pill with a number, used on navigation entries. Renders nothing for an unknown or
 * zero count. Decorative: the parent link carries the count in its accessible name.
 */
export function CountBadge({ count, className }: CountBadgeProps) {
  if (count === undefined || count <= 0) return null;

  return (
    <span
      aria-hidden="true"
      className={[
        "bg-primary text-primary-foreground grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.65rem] leading-none font-bold",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
