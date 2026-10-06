import { DEFAULT_SIGNED_IN_PATH, LOGIN_PATH } from "./constants";

/** Routes reachable without a session. Everything else requires one. */
export const PUBLIC_PATHS = ["/login", "/register"] as const;

type RouteAccessInput = {
  pathname: string;
  /** The query string, including its leading `?`, or `""`. */
  search: string;
  /** Whether the request carries the session cookie (presence only, not validity). */
  hasSessionCookie: boolean;
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * The optimistic redirect for a request, or `null` to let it through. Decides on cookie
 * presence only: a stale cookie passes here and is caught by `getSession()` (the backend is
 * the real authority).
 *
 * - No cookie on a protected route → `/login?next=<path+search>`.
 * - Cookie on `/login` or `/register` → the feed.
 */
export function getRouteRedirect({
  pathname,
  search,
  hasSessionCookie,
}: RouteAccessInput): string | null {
  const isPublic = isPublicPath(pathname);

  if (isPublic) return hasSessionCookie ? DEFAULT_SIGNED_IN_PATH : null;
  if (hasSessionCookie) return null;

  // `/` only forwards to the feed, so it isn't worth carrying as `next`.
  if (pathname === "/") return LOGIN_PATH;
  return `${LOGIN_PATH}?${new URLSearchParams({ next: `${pathname}${search}` })}`;
}
