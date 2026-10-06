import { DEFAULT_SIGNED_IN_PATH, LOGIN_PATH } from "./constants";
import { withNextParam } from "./redirect-path";

/** Routes reachable without a session. Everything else requires one. */
export const PUBLIC_PATHS = ["/login", "/register"] as const;

/** Query parameter Next adds to client-navigation (RSC) requests; never part of a page URL. */
const RSC_SEARCH_PARAM = "_rsc";

type RouteAccessInput = {
  /** The requested page as `path + search` (see `getPagePath`). */
  pagePath: string;
  /** Whether the request carries the session cookie (presence only, not validity). */
  hasSessionCookie: boolean;
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * The page a request is for, as `path + search`, without Next's internal `_rsc` parameter. It's
 * what a `next` parameter should point back to.
 */
export function getPagePath(url: { pathname: string; search: string }): string {
  const searchParams = new URLSearchParams(url.search);
  searchParams.delete(RSC_SEARCH_PARAM);
  const search = searchParams.toString();
  return search ? `${url.pathname}?${search}` : url.pathname;
}

/**
 * The optimistic redirect for a request, or `null` to let it through. Decides on cookie
 * presence only: a stale cookie passes here and is caught by `getSession()` (the backend is
 * the real authority).
 *
 * - No cookie on a protected route → `/login?next=<path+search>`.
 * - Cookie on `/login` or `/register` → the feed.
 */
export function getRouteRedirect({ pagePath, hasSessionCookie }: RouteAccessInput): string | null {
  const pathname = pagePath.split(/[?#]/, 1)[0] ?? pagePath;

  if (isPublicPath(pathname)) return hasSessionCookie ? DEFAULT_SIGNED_IN_PATH : null;
  if (hasSessionCookie) return null;

  return withNextParam(LOGIN_PATH, pagePath);
}
