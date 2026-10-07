// Pieces shared by the form field primitives (TextField, SelectField).

/** Base look of text-like controls. `aria-invalid` turns the border to the error color. */
export const CONTROL_CLASSES =
  "border-border-strong bg-background text-foreground placeholder:text-subtle focus-visible:outline-ring aria-invalid:border-error w-full min-w-0 rounded-lg border px-3 py-2.5 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-1";

/** Joins the ids of the descriptions that are rendered, for `aria-describedby`. */
export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

type FieldMessagesProps = {
  hintId: string;
  hint?: string;
  errorId: string;
  error?: string;
};

/** A field's hint and validation error, with the ids its control references. */
export function FieldMessages({ hintId, hint, errorId, error }: FieldMessagesProps) {
  return (
    <>
      {hint && (
        <p id={hintId} className="text-muted text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-error text-sm font-medium">
          {error}
        </p>
      )}
    </>
  );
}
