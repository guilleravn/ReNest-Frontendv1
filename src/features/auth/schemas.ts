import { z } from "zod";

/** Field limits shared by the schemas and the inputs' `maxLength` (same as the backend). */
export const AUTH_FIELD_LIMITS = {
  fullNameMax: 120,
  emailMax: 255,
  passwordMin: 8,
  passwordMax: 128,
} as const;

/** Field error copy, also used to map backend rejections to a field. */
export const AUTH_FIELD_MESSAGES = {
  fullName: "Ingresa tu nombre",
  email: "Correo no válido",
  city: "Elige tu zona para coordinar recogidas",
  phone: "Teléfono no válido",
  password: "La contraseña debe tener al menos 8 caracteres",
  loginPassword: "Ingresa tu contraseña",
  /** Over-length login password: only reachable by bypassing the input's `maxLength`. */
  invalidInput: "Revisa los datos e intenta de nuevo.",
} as const;

const MESSAGES = AUTH_FIELD_MESSAGES;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/**
 * Removes the separators people type in phone numbers (spaces, hyphens, dots, parentheses),
 * exactly as the backend does before checking the E.164 format.
 */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-.()]/g, "");
}

const emailSchema = z
  .string({ error: MESSAGES.email })
  .trim()
  .pipe(z.email({ error: MESSAGES.email }).max(AUTH_FIELD_LIMITS.emailMax, MESSAGES.email));

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: MESSAGES.loginPassword })
    .min(1, MESSAGES.loginPassword)
    .max(AUTH_FIELD_LIMITS.passwordMax, MESSAGES.invalidInput),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Sign-up form → `POST /auth/register` body: an empty phone becomes `null`. `city` only needs
 * to be present here; the backend checks it against `GET /zones` (its source of truth).
 */
export const registerSchema = z.object({
  fullName: z
    .string({ error: MESSAGES.fullName })
    .trim()
    .min(2, MESSAGES.fullName)
    .max(AUTH_FIELD_LIMITS.fullNameMax, MESSAGES.fullName),
  email: emailSchema,
  city: z.string({ error: MESSAGES.city }).trim().min(1, MESSAGES.city),
  phoneE164: z.preprocess(
    (value) => (typeof value === "string" ? normalizePhone(value) || null : (value ?? null)),
    z.string({ error: MESSAGES.phone }).regex(E164_PATTERN, MESSAGES.phone).nullable(),
  ),
  password: z
    .string({ error: MESSAGES.password })
    .min(AUTH_FIELD_LIMITS.passwordMin, MESSAGES.password)
    .max(AUTH_FIELD_LIMITS.passwordMax, MESSAGES.password),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** `GET /zones` response: the zones a user can pick at sign-up (also the option labels). */
export const zonesSchema = z.array(z.string().trim().min(1)).min(1);

/** `POST /auth/login` and `POST /auth/register` response. */
export const authTokenSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.iso.datetime(),
});

export type AuthToken = z.infer<typeof authTokenSchema>;

/** `GET /auth/me` response. */
export const sessionUserSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  fullName: z.string(),
  city: z.string(),
  phoneE164: z.string().nullable(),
  isVerified: z.boolean(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
