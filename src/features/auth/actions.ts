"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { DEFAULT_SIGNED_IN_PATH, LOGIN_PATH } from "@/lib/auth/constants";
import { safeRedirectPath } from "@/lib/auth/redirect-path";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { setFlash } from "@/lib/flash/flash";

import { login, register } from "./api";
import {
  AUTH_ERROR_MESSAGES,
  getAuthErrorKind,
  type LoginState,
  type RegisterState,
} from "./form-state";
import { loginSchema, registerSchema, type AuthToken } from "./schemas";

/** A text field from the form, or `undefined` when it's missing (or a file). */
function readText(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = readText(formData, "email");
  const values = { email: email ?? "" };

  const result = loginSchema.safeParse({ email, password: readText(formData, "password") });
  if (!result.success) {
    return { status: "error", fieldErrors: z.flattenError(result.error).fieldErrors, values };
  }

  let token: AuthToken;
  try {
    token = await login(result.data);
  } catch (error) {
    const kind = getAuthErrorKind(error);
    if (!kind) throw error;
    // An unknown email and a wrong password get the same 401, hence the same message.
    return { status: "error", formError: AUTH_ERROR_MESSAGES[kind], fieldErrors: {}, values };
  }

  await setSessionCookie(token.accessToken, token.expiresAt);
  // `next` comes from a hidden field the user controls: re-validated here.
  redirect(safeRedirectPath(formData.get("next")));
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    fullName: readText(formData, "fullName"),
    email: readText(formData, "email"),
    city: readText(formData, "city"),
    phoneE164: readText(formData, "phoneE164"),
    password: readText(formData, "password"),
    acceptedTerms: readText(formData, "acceptedTerms"),
  };
  const values = {
    fullName: raw.fullName ?? "",
    email: raw.email ?? "",
    city: raw.city ?? "",
    phoneE164: raw.phoneE164 ?? "",
    acceptedTerms: raw.acceptedTerms === "on",
  };

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return { status: "error", fieldErrors: z.flattenError(result.error).fieldErrors, values };
  }

  let token: AuthToken;
  try {
    token = await register(result.data);
  } catch (error) {
    const kind = getAuthErrorKind(error);
    if (!kind) throw error;
    if (kind === "emailTaken") {
      return {
        status: "error",
        fieldErrors: { email: [AUTH_ERROR_MESSAGES.emailTaken] },
        values,
      };
    }
    return { status: "error", formError: AUTH_ERROR_MESSAGES[kind], fieldErrors: {}, values };
  }

  await setSessionCookie(token.accessToken, token.expiresAt);
  await setFlash(`¡Cuenta creada! Bienvenido, ${result.data.fullName}`);
  redirect(DEFAULT_SIGNED_IN_PATH);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect(LOGIN_PATH);
}
