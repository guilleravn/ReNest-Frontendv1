import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { EXPIRED_SESSION_PATH, PAGE_PATH_HEADER } from "./constants";
import { withNextParam } from "./redirect-path";

/**
 * Sends the user to the expired-session handler, carrying the current page as `next` so
 * signing in again brings them back. The page comes from the header `src/proxy.ts` sets on
 * every page request (including client navigations and Server Action posts). Throws like any
 * `redirect()`.
 */
export async function redirectToExpiredSession(): Promise<never> {
  const pagePath = (await headers()).get(PAGE_PATH_HEADER);
  redirect(withNextParam(EXPIRED_SESSION_PATH, pagePath));
}
