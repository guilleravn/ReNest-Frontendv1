"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { loginAction } from "@/features/auth/actions";
import { INITIAL_LOGIN_STATE } from "@/features/auth/form-state";

import { useFocusFirstInvalidField } from "./use-focus-first-invalid-field";

type LoginFormProps = {
  /** Where to go after signing in; re-validated by the action. */
  next?: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_LOGIN_STATE);
  const formRef = useFocusFirstInvalidField(state);
  const hasError = state.status === "error";

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      {hasError && state.formError && <FormAlert>{state.formError}</FormAlert>}
      {next && <input type="hidden" name="next" value={next} />}

      <TextField
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        required
        defaultValue={hasError ? state.values.email : undefined}
        error={hasError ? state.fieldErrors.email?.[0] : undefined}
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        error={hasError ? state.fieldErrors.password?.[0] : undefined}
      />

      <Button type="submit" isFullWidth disabled={isPending} className="mt-2">
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
