import "server-only";

import { apiFetch } from "@/lib/api/server";

import {
  authTokenSchema,
  sessionUserSchema,
  type AuthToken,
  type LoginInput,
  type RegisterInput,
  type SessionUser,
  zonesSchema,
} from "./schemas";

/** `POST /auth/login`. 401 for an unknown email and for a wrong password alike. */
export function login(input: LoginInput): Promise<AuthToken> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: input,
    schema: authTokenSchema,
    auth: false,
  });
}

/** `POST /auth/register`. Creates the account and signs it in; 409 if the email exists. */
export function register(input: RegisterInput): Promise<AuthToken> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: input,
    schema: authTokenSchema,
    auth: false,
  });
}

/** `GET /auth/me`. Throws `ApiError` 401 for a missing, expired or invalid token. */
export function getCurrentUser(): Promise<SessionUser> {
  return apiFetch("/auth/me", {
    schema: sessionUserSchema,
    onUnauthorized: "throw",
    cache: "no-store",
  });
}

/**
 * `GET /zones` (public). Not cached: it's one small request per visit to `/register`, a stale
 * copy could offer a zone the backend has since dropped (it validates `city` against this
 * list), and a Data Cache entry would be keyed by the forwarded client IP anyway.
 */
export function getZones(): Promise<string[]> {
  return apiFetch("/zones", { schema: zonesSchema, auth: false, cache: "no-store" });
}
