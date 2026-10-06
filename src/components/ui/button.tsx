const BUTTON_VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  outline: "border border-border-strong text-foreground hover:bg-surface-sunken",
} as const satisfies Record<string, string>;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  /** Stretch to the container's width (e.g. a form's submit button). */
  isFullWidth?: boolean;
};

export function Button({
  variant = "primary",
  isFullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        "focus-visible:outline-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        BUTTON_VARIANTS[variant],
        isFullWidth && "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
