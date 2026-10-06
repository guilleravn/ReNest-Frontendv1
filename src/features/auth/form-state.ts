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
  acceptedTerms: boolean;
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
    switch (error.status) {
      case 401:
        return "invalidCredentials";
      case 409:
        return "emailTaken";
      case 429:
        return "tooManyAttempts";
      default:
        // 5xx, or a 400 the mirrored client-side validation should have prevented.
        return "unavailable";
    }
  }
  // `fetch` rejects with a TypeError when the backend can't be reached.
  if (error instanceof TypeError) return "unavailable";
  return null;
}
