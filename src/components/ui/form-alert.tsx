type FormAlertProps = {
  children: React.ReactNode;
  className?: string;
};

/** Error about a whole form (not one field), announced as soon as it appears. */
export function FormAlert({ children, className }: FormAlertProps) {
  return (
    <div
      role="alert"
      className={[
        "border-error bg-error-surface text-foreground rounded-lg border px-3 py-2.5 text-sm font-medium",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
