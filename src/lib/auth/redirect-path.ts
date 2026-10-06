import { DEFAULT_SIGNED_IN_PATH } from "./constants";

// Control characters and whitespace: browsers strip tabs/newlines from URLs, so "/\t/evil.com"
// would become the protocol-relative "//evil.com".
const UNSAFE_CHARACTERS = /[\u0000- \u007f]/;

// Route Handlers are never a page to land on (e.g. `/api/auth/expired` would sign the user out).
const API_PATH = /^\/api(?:[/?#]|$)/i;

// Only used to resolve paths the way a browser would; never visited.
const RESOLVE_BASE = "http://renest.invalid";

/**
 * Whether the path the browser would actually request is under `/api`. Resolves it first, so dot
 * segments (`/./api`, `/feed/../api`, `/%2e/api`) can't hide it, and also checks the
 * percent-decoded form.
 */
function resolvesUnderApi(path: string): boolean {
  let pathname: string;
  try {
    pathname = new URL(path, RESOLVE_BASE).pathname;
  } catch {
    return true; // Unparseable: treat as unsafe.
  }
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Malformed escapes: the raw pathname check below still applies.
  }
  return API_PATH.test(pathname) || API_PATH.test(decoded);
}

/**
 * Whether `path` is an internal page path that is safe to redirect to: it starts with a single
 * `/` (not `//` or `/\`, which browsers treat as another host), has no control characters and
 * doesn't resolve under `/api`. The path is used as given (not normalized): a browser resolves
 * it against this site's origin, so e.g. `/..//evil.com` stays on this host, while its
 * normalized form `//evil.com` would not.
 */
export function isSafeRedirectPath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\") &&
    !UNSAFE_CHARACTERS.test(path) &&
    !resolvesUnderApi(path)
  );
}

/**
 * The post-login destination from an untrusted `next` value (query string or form field).
 * Anything that isn't a safe internal path falls back to the feed, so `next` can never be
 * used as an open redirect.
 */
export function safeRedirectPath(next: unknown): string {
  return isSafeRedirectPath(next) ? next : DEFAULT_SIGNED_IN_PATH;
}

/**
 * `path` with `?next=<next>` when `next` is a safe path worth carrying, else `path` alone. `/`
 * is dropped: it only forwards to the feed, the default destination anyway.
 */
export function withNextParam(path: string, next: unknown): string {
  if (!isSafeRedirectPath(next) || next === "/") return path;
  return `${path}?${new URLSearchParams({ next })}`;
}
