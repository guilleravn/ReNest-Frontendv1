import { z } from "zod";

/** Zones a user can pick at sign-up. Exact strings: the backend validates against them. */
export const USER_ZONES = [
  "Roma Norte, CDMX",
  "Condesa, CDMX",
  "Palermo, Buenos Aires",
  "Providencia, Santiago",
  "Chapinero, Bogotá",
  "Miraflores, Lima",
  "Pinheiros, São Paulo",
] as const;

export type UserZone = (typeof USER_ZONES)[number];

/** Field limits shared by the schemas and the inputs' `maxLength` (same as the backend). */
export const AUTH_FIELD_LIMITS = {
  fullNameMax: 120,
  emailMax: 255,
  passwordMin: 8,
  passwordMax: 128,
} as const;

const MESSAGES = {
  fullName: "Ingresa tu nombre",
  email: "Correo no válido",
  city: "Elige tu zona para coordinar recogidas",
  phone: "Teléfono no válido",
  password: "La contraseña debe tener al menos 8 caracteres",
  loginPassword: "Ingresa tu contraseña",
  terms: "Acepta los Términos y la Política de privacidad",
} as const;

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
  password: z.string({ error: MESSAGES.loginPassword }).min(1, MESSAGES.loginPassword),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Sign-up form → `POST /auth/register` body. Accepts the raw form values (the checkbox sends
 * `"on"`) and outputs the backend payload: an empty phone becomes `null`.
 */
export const registerSchema = z.object({
  fullName: z
    .string({ error: MESSAGES.fullName })
    .trim()
    .min(2, MESSAGES.fullName)
    .max(AUTH_FIELD_LIMITS.fullNameMax, MESSAGES.fullName),
  email: emailSchema,
  city: z.enum(USER_ZONES, { error: MESSAGES.city }),
  phoneE164: z.preprocess(
    (value) => (typeof value === "string" ? normalizePhone(value) || null : (value ?? null)),
    z.string({ error: MESSAGES.phone }).regex(E164_PATTERN, MESSAGES.phone).nullable(),
  ),
  password: z
    .string({ error: MESSAGES.password })
    .min(AUTH_FIELD_LIMITS.passwordMin, MESSAGES.password)
    .max(AUTH_FIELD_LIMITS.passwordMax, MESSAGES.password),
  acceptedTerms: z.preprocess(
    (value) => value === "on" || value === true,
    z.literal(true, { error: MESSAGES.terms }),
  ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

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
