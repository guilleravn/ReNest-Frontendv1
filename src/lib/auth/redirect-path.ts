import { DEFAULT_SIGNED_IN_PATH } from "./constants";

// Control characters and whitespace: browsers strip tabs/newlines from URLs, so "/\t/evil.com"
// would become the protocol-relative "//evil.com".
const UNSAFE_CHARACTERS = /[\u0000- \u007f]/;

/**
 * Whether `path` is an internal path that is safe to redirect to: it starts with a single
 * `/` (not `//` or `/\`, which browsers treat as another host) and has no control characters.
 */
export function isSafeRedirectPath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\") &&
    !UNSAFE_CHARACTERS.test(path)
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
