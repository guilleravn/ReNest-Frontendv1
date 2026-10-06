import { useEffect, useRef } from "react";

/**
 * After a submit that comes back with field errors, moves focus to the first invalid field,
 * so keyboard and screen reader users land on it and hear its error (via aria-describedby).
 * Form-level errors are announced by their `role="alert"` instead. Returns the form's ref.
 */
export function useFocusFirstInvalidField(state: { status: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  return formRef;
}
