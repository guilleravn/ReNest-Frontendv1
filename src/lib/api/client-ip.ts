import { isIP } from "node:net";

/**
 * The client IP to forward to the backend, from the incoming `X-Forwarded-For`, or `null`.
 *
 * Takes the **rightmost** entry: the one added by the closest trusted hop. Behind Vercel the
 * header holds only the client IP; behind a reverse proxy that appends (nginx
 * `$proxy_add_x_forwarded_for`) the rightmost entry is the address that proxy saw, while the
 * entries to its left are client-supplied and spoofable. Self-hosted Next only sets the header
 * when it's missing (to the socket address), so Next must not be reachable directly: see
 * docs/architecture.md, "Client IP". Anything that isn't a bare IPv4/IPv6 address is dropped.
 */
export function getClientIp(forwardedFor: string | null): string | null {
  const closest = forwardedFor?.split(",").at(-1)?.trim();
  return closest && isIP(closest) ? closest : null;
}
