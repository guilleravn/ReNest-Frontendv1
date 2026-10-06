import { NextResponse, type NextRequest } from "next/server";

import type { SessionUser } from "@/features/auth/schemas";
import { LOGIN_PATH } from "@/lib/auth/constants";
import { safeRedirectPath, withNextParam } from "@/lib/auth/redirect-path";
import { clearSessionCookie, getSession } from "@/lib/auth/session";

/**
 * Landing point for an expired or rejected session: Server Components can't delete cookies,
 * so they redirect here (`?next=<page>`). Excluded from the proxy matcher, since it must run
 * while the stale cookie is still present.
 *
 * It only clears a cookie the backend itself rejects (`GET /auth/me` → 401). Anyone can link
 * here (it's a GET), so a cross-site link must not be able to sign a user out: a valid session
 * is left alone and the user just continues to `next`. Origin/`Sec-Fetch-Site` checks were
 * rejected because a legitimate redirect chain that starts on another site (a link from an
 * email to a protected page) is cross-site too, and refusing to clear there would loop
 * between `/login` and the protected page.
 */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");

  let user: SessionUser | null | "unknown";
  try {
    user = await getSession();
  } catch {
    // Backend unreachable: keep the cookie and let the page's error boundary explain.
    user = "unknown";
  }

  if (user === null) {
    await clearSessionCookie();
    return NextResponse.redirect(new URL(withNextParam(LOGIN_PATH, next), request.url));
  }
  return NextResponse.redirect(new URL(safeRedirectPath(next), request.url));
}
