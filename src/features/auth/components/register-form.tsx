"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormAlert } from "@/components/ui/form-alert";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { registerAction } from "@/features/auth/actions";
import { INITIAL_REGISTER_STATE } from "@/features/auth/form-state";
import { AUTH_FIELD_LIMITS, USER_ZONES } from "@/features/auth/schemas";

import { useFocusFirstInvalidField } from "./use-focus-first-invalid-field";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, INITIAL_REGISTER_STATE);
  const formRef = useFocusFirstInvalidField(state);
  const values = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      {state.status === "error" && state.formError && <FormAlert>{state.formError}</FormAlert>}

      <TextField
        label="Nombre"
        name="fullName"
        autoComplete="name"
        placeholder="Tu nombre"
        required
        maxLength={AUTH_FIELD_LIMITS.fullNameMax}
        defaultValue={values?.fullName}
        error={errors.fullName?.[0]}
      />
      <TextField
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
        required
        maxLength={AUTH_FIELD_LIMITS.emailMax}
        defaultValue={values?.email}
        error={errors.email?.[0]}
      />
      <SelectField
        label="Tu zona"
        name="city"
        options={USER_ZONES}
        placeholder="Elige tu zona"
        required
        defaultValue={values?.city ?? ""}
        hint="Para mostrarte artículos cerca y coordinar recogidas."
        error={errors.city?.[0]}
      />
      <TextField
        label="Teléfono"
        name="phoneE164"
        type="tel"
        autoComplete="tel"
        placeholder="+52 55 1234 5678"
        isOptional
        defaultValue={values?.phoneE164}
        hint="Se usa para coordinar la entrega por WhatsApp."
        error={errors.phoneE164?.[0]}
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
        maxLength={AUTH_FIELD_LIMITS.passwordMax}
        hint="Al menos 8 caracteres."
        error={errors.password?.[0]}
      />
      <Checkbox
        name="acceptedTerms"
        required
        defaultChecked={values?.acceptedTerms}
        error={errors.acceptedTerms?.[0]}
        label={
          <>
            Acepto los <strong className="text-primary font-semibold">Términos</strong> y la{" "}
            <strong className="text-primary font-semibold">Política de privacidad</strong>.
          </>
        }
      />

      <Button type="submit" isFullWidth disabled={isPending} className="mt-2">
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-muted flex items-start gap-2 text-sm">
        <ShieldCheckIcon className="text-verified mt-0.5 size-4 shrink-0" />
        Verificamos la identidad de cada miembro para que compres y vendas con confianza.
      </p>
    </form>
  );
}
