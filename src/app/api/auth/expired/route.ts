import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import type { SessionUser } from "@/features/auth/schemas";
import { EXPIRED_HOP_COOKIE, EXPIRED_HOP_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { decideExpiredAction } from "@/lib/auth/expired-decision";
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
 *
 * Loop guard: if `next` answers 401 even though the session is valid, that page would send the
 * user back here forever. The round trip is remembered in a short-lived cookie (see
 * `decideExpiredAction`), not a query flag, so `next` stays clean and the mark can't be baked
 * into a shared link.
 */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const cookieStore = await cookies();

  let user: SessionUser | null | "unknown";
  try {
    user = await getSession();
  } catch {
    // Backend unreachable: keep the cookie and let the page's error boundary explain.
    user = "unknown";
  }

  const decision = decideExpiredAction({
    next,
    user,
    previousHop: cookieStore.get(EXPIRED_HOP_COOKIE)?.value,
  });

  if (decision.kind === "login") {
    await clearSessionCookie();
  } else if (decision.kind === "continue") {
    cookieStore.set(EXPIRED_HOP_COOKIE, decision.hop, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRED_HOP_MAX_AGE_SECONDS,
    });
  } else {
    // Reset the guard so a later retry gets a fresh round trip.
    cookieStore.delete(EXPIRED_HOP_COOKIE);
  }
  return NextResponse.redirect(new URL(decision.to, request.url));
}
