import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";

import { getCurrentUser } from "@/features/auth/api";
import type { SessionUser } from "@/features/auth/schemas";
import { ApiError } from "@/lib/api/errors";

import { AUTH_COOKIE } from "./constants";
import { redirectToExpiredSession } from "./expired-session";

/**
 * The single server-side entry point to the session (INV-5). Pages, layouts and actions read
 * the user through here and never touch the `renest_token` cookie themselves, so a future auth
 * provider only changes this module. (`apiFetch` also reads the cookie, only to attach the
 * Bearer header.)
 */

/**
 * The signed-in user, or `null` when there is no session cookie or the backend rejects it
 * (401). Memoized per request, so a layout and its page share one `GET /auth/me`. Without a
 * cookie it returns `null` without calling the backend. Other failures (network, 5xx, a
 * response that breaks the contract) are thrown to the nearest error boundary.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  if (!(await cookies()).has(AUTH_COOKIE)) return null;

  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

/**
 * The signed-in user for protected layouts and pages. Without a valid session it redirects to
 * the expired-session handler, which clears the stale cookie (Server Components can't) and
 * then sends the user to login, with the current page as `next`.
 *
 * Layouts don't re-render on client navigation within their group, so a page that loads
 * private data calls this itself (or relies on `apiFetch`'s 401 redirect) instead of trusting
 * its layout's check (INV-5).
 */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) return redirectToExpiredSession();
  return user;
}

/**
 * Stores the backend JWT. Only from a Server Action or Route Handler (cookies can't be set
 * while rendering). It expires with the token, so the session survives closing the browser.
 */
export async function setSessionCookie(accessToken: string, expiresAt: string): Promise<void> {
  (await cookies()).set(AUTH_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Signs the user out locally (tokens aren't revoked in the MVP). Server Action/Route Handler only. */
export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE);
}
