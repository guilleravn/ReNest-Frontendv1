import { useId } from "react";

import { CONTROL_CLASSES, FieldMessages, describedBy } from "./field-messages";

type TextFieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  label: string;
  /** Help text under the input, read after the label. */
  hint?: string;
  /** Validation message; marks the input invalid while present. */
  error?: string;
  /** Shows an "Opcional" tag next to the label. */
  isOptional?: boolean;
};

/** Labelled text input with optional hint and error, wired for assistive tech. */
export function TextField({
  label,
  hint,
  error,
  isOptional = false,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const optionalId = `${id}-optional`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-foreground text-sm font-medium">
          {label}
        </label>
        {isOptional && (
          <span id={optionalId} className="text-muted text-xs">
            Opcional
          </span>
        )}
      </div>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(isOptional && optionalId, hint && hintId, error && errorId)}
        className={CONTROL_CLASSES}
      />
      <FieldMessages hintId={hintId} hint={hint} errorId={errorId} error={error} />
    </div>
  );
}
