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

/**
 * Request header that `src/proxy.ts` sets (always overwriting any client value) to the
 * requested page's `path + search`. Server Components can't read the URL otherwise, and the
 * expired-session redirect needs it to bring the user back after signing in again.
 */
export const PAGE_PATH_HEADER = "x-renest-page-path";

/**
 * Short-lived httpOnly cookie the expired-session handler sets when it sends a valid session
 * back to `next`. Its value is that `next`; seeing the same one again within
 * `EXPIRED_HOP_MAX_AGE_SECONDS` means the page keeps answering 401 despite a valid session.
 */
export const EXPIRED_HOP_COOKIE = "renest_expired_hop";

/** How long the loop-guard cookie lives. */
export const EXPIRED_HOP_MAX_AGE_SECONDS = 30;

/** Page that explains a session round trip that didn't fix the page (the loop guard's exit). */
export const SESSION_ERROR_PATH = "/session-error";
