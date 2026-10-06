import { z } from "zod";

import { ApiError } from "@/lib/api/errors";

import type { LoginInput, RegisterInput } from "./schemas";

type FieldErrors<TInput> = Partial<Record<keyof TInput, string[]>>;

/** `loginAction` state. The password is never echoed back. */
export type LoginState =
  | { status: "idle" }
  | {
      status: "error";
      /** Error about the whole form (wrong credentials, rate limit, backend down). */
      formError?: string;
      fieldErrors: FieldErrors<LoginInput>;
      values: { email: string };
    };

export type RegisterValues = {
  fullName: string;
  email: string;
  city: string;
  phoneE164: string;
};

/** `registerAction` state. The password is never echoed back. */
export type RegisterState =
  | { status: "idle" }
  | {
      status: "error";
      formError?: string;
      fieldErrors: FieldErrors<RegisterInput>;
      values: RegisterValues;
    };

export const INITIAL_LOGIN_STATE: LoginState = { status: "idle" };
export const INITIAL_REGISTER_STATE: RegisterState = { status: "idle" };

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "Correo o contraseña incorrectos",
  emailTaken: "Ya existe una cuenta con este correo.",
  tooManyAttempts: "Demasiados intentos. Espera un minuto e intenta de nuevo.",
  invalidInput: "Revisa los datos e intenta de nuevo.",
  unavailable: "No pudimos conectar con ReNest. Intenta de nuevo.",
} as const;

export type AuthErrorKind = keyof typeof AUTH_ERROR_MESSAGES;

/**
 * Classifies a failed `POST /auth/login` or `/auth/register`. Returns `null` for anything that
 * isn't a backend or network failure (e.g. a response that breaks the contract), which the
 * caller re-throws so it fails loudly.
 */
export function getAuthErrorKind(error: unknown): AuthErrorKind | null {
  if (error instanceof ApiError) {
    if (error.status === 401) return "invalidCredentials";
    if (error.status === 409) return "emailTaken";
    if (error.status === 429) return "tooManyAttempts";
    // Any other 4xx (e.g. a 400 the mirrored client-side validation didn't catch).
    if (error.status >= 400 && error.status < 500) return "invalidInput";
    return "unavailable";
  }
  // `fetch` rejects with a TypeError when the backend can't be reached.
  if (error instanceof TypeError) return "unavailable";
  return null;
}

const nestErrorBodySchema = z.object({ message: z.union([z.string(), z.array(z.string())]) });

/**
 * Whether a 400 from the backend rejected `field`. Nest's validation messages start with the
 * property name (e.g. `"city must be one of the following values: …"`), which is the only way
 * to tell which field failed.
 */
export function isFieldRejected(error: unknown, field: string): boolean {
  if (!(error instanceof ApiError) || error.status !== 400) return false;
  const body = nestErrorBodySchema.safeParse(error.body);
  if (!body.success) return false;
  const messages = typeof body.data.message === "string" ? [body.data.message] : body.data.message;
  return messages.some((message) => message.trimStart().startsWith(`${field} `));
}
