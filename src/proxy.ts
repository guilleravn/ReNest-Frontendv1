import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth/constants";
import { getRouteRedirect } from "@/lib/auth/route-access";

/**
 * Optimistic route protection (INV-5): redirects by the session cookie's presence only, with
 * no backend call. Real authorization happens in the backend; a stale cookie is caught by
 * `getSession()` in the protected layouts.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const redirectTo = getRouteRedirect({
    pathname,
    search,
    hasSessionCookie: request.cookies.has(AUTH_COOKIE),
  });

  return redirectTo ? NextResponse.redirect(new URL(redirectTo, request.url)) : NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except Next internals, public assets, the favicon and the expired-session
    // handler (it must run with a stale cookie, and it only clears it).
    "/((?!_next/static|_next/image|brand/|favicon\\.ico|api/auth/expired|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
