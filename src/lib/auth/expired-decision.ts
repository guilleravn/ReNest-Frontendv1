import { LOGIN_PATH, SESSION_ERROR_PATH } from "./constants";
import { safeRedirectPath, withNextParam } from "./redirect-path";

type ExpiredDecisionInput = {
  /** Raw `next` query value (untrusted). */
  next: string | null;
  /** `GET /auth/me` result: `null` = the backend rejected the cookie, `"unknown"` = unreachable. */
  user: object | null | "unknown";
  /** Value of the loop-guard cookie from the previous pass, if any. */
  previousHop: string | undefined;
};

export type ExpiredDecision =
  | { kind: "login"; to: string }
  | { kind: "continue"; to: string; hop: string }
  | { kind: "error"; to: typeof SESSION_ERROR_PATH };

/**
 * What the expired-session handler does:
 *
 * - Cookie rejected (401) → clear it, go to `/login?next=`.
 * - Session valid (or backend unreachable) → go on to `next`, and remember it in the hop
 *   cookie. If the same `next` comes back within the cookie's lifetime, `next` itself keeps
 *   answering 401 for a valid session, so stop and show an error instead of redirecting forever.
 */
export function decideExpiredAction({
  next,
  user,
  previousHop,
}: ExpiredDecisionInput): ExpiredDecision {
  if (user === null) return { kind: "login", to: withNextParam(LOGIN_PATH, next) };
  const target = safeRedirectPath(next);
  if (previousHop === target) return { kind: "error", to: SESSION_ERROR_PATH };
  return { kind: "continue", to: target, hop: target };
}
