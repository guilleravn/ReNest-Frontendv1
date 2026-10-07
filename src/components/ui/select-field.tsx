import { useId } from "react";

import { CONTROL_CLASSES, FieldMessages, describedBy } from "./field-messages";
import { ChevronDownIcon } from "./icons";

type SelectFieldProps = Omit<React.ComponentProps<"select">, "id" | "children"> & {
  label: string;
  /** Values that double as their visible labels. */
  options: readonly string[];
  /** Disabled first option shown while nothing is chosen (needs `defaultValue=""`). */
  placeholder?: string;
  hint?: string;
  error?: string;
};

/** Labelled native `<select>` with optional hint and error, wired for assistive tech. */
export function SelectField({
  label,
  options,
  placeholder,
  hint,
  error,
  className,
  defaultValue,
  ...props
}: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          // React applies `defaultValue` to a <select> only on mount, and a Server Action form
          // is reset after each submit, back to the mounted default. Remounting when it
          // changes keeps the value a failed submit hands back (`defaultValue={state.values.x}`).
          // (`key` goes before the spread: after it, React mis-validates the children's keys.)
          key={String(defaultValue ?? "")}
          {...props}
          defaultValue={defaultValue}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint && hintId, error && errorId)}
          // `invalid:` dims the placeholder option while a required select has no value.
          className={`${CONTROL_CLASSES} invalid:text-subtle [&_option]:text-foreground appearance-none pr-10`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
      </div>
      <FieldMessages hintId={hintId} hint={hint} errorId={errorId} error={error} />
    </div>
  );
}
