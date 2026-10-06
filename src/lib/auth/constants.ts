// Plain constants (no `server-only`): `src/proxy.ts` imports them too.

/** httpOnly cookie that holds the backend JWT. Only `lib/auth/session.ts` writes it. */
export const AUTH_COOKIE = "renest_token";

/** Where signed-out users are sent. */
export const LOGIN_PATH = "/login";

/** Where users land after signing in when there is no valid `next` path. */
export const DEFAULT_SIGNED_IN_PATH = "/feed";

/**
 * Route Handler that clears an expired or rejected session cookie and redirects to login.
 * Server Components can't delete cookies, so they redirect here instead.
 */
export const EXPIRED_SESSION_PATH = "/api/auth/expired";
