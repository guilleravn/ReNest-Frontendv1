import { cn } from "@/lib/cn";

type CountBadgeProps = {
  count: number;
  className?: string;
};

/** Small green pill with a number. Renders nothing when the count is 0. */
export function CountBadge({ count, className }: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-4 min-w-4 place-items-center rounded-full bg-green-strong px-1 text-[0.65rem] leading-none font-bold text-white",
        className,
      )}
    >
      {count}
    </span>
  );
}
