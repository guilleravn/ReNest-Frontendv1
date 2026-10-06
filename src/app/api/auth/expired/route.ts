import { NextResponse, type NextRequest } from "next/server";

import { LOGIN_PATH } from "@/lib/auth/constants";
import { clearSessionCookie } from "@/lib/auth/session";

/**
 * Landing point for an expired or rejected session: Server Components can't delete cookies,
 * so they redirect here. Clears the cookie and continues to login. Excluded from the proxy
 * matcher, since it must run while the stale cookie is still present.
 */
export async function GET(request: NextRequest) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
}
