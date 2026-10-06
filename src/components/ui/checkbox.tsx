import { useId } from "react";

import { FieldMessages, describedBy } from "./field-messages";

type CheckboxProps = Omit<React.ComponentProps<"input">, "id" | "type"> & {
  /** Visible label; may contain emphasis. */
  label: React.ReactNode;
  error?: string;
};

/** Native checkbox with a clickable label and an optional error, wired for assistive tech. */
export function Checkbox({ label, error, className, ...props }: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error && errorId)}
          className="accent-primary focus-visible:outline-ring mt-0.5 size-5 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <label htmlFor={id} className="text-muted text-sm">
          {label}
        </label>
      </div>
      <FieldMessages hintId={`${id}-hint`} errorId={errorId} error={error} />
    </div>
  );
}
