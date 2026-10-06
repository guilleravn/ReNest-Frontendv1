import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE, PAGE_PATH_HEADER } from "@/lib/auth/constants";
import { getPagePath, getRouteRedirect } from "@/lib/auth/route-access";

/**
 * Optimistic route protection (INV-5): redirects by the session cookie's presence only, with
 * no backend call. Real authorization happens in the backend; a stale cookie is caught by
 * `getSession()` in the protected layouts.
 *
 * Requests it lets through get `PAGE_PATH_HEADER` (always overwritten, so a client can't
 * choose it) with the page they're for, so the server can send an expired session back there.
 */
export function proxy(request: NextRequest) {
  const pagePath = getPagePath(request.nextUrl);

  const redirectTo = getRouteRedirect({
    pagePath,
    hasSessionCookie: request.cookies.has(AUTH_COOKIE),
  });
  if (redirectTo) return NextResponse.redirect(new URL(redirectTo, request.url));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PAGE_PATH_HEADER, pagePath);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Everything except Next internals, public assets, the favicon and the expired-session
    // handler (it must run with a stale cookie).
    "/((?!_next/static|_next/image|brand/|favicon\\.ico|api/auth/expired|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
