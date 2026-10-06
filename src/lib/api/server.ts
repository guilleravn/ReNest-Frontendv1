import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";

import { AUTH_COOKIE, EXPIRED_SESSION_PATH } from "@/lib/auth/constants";
import { serverEnv } from "@/lib/env";

import { ApiError } from "./errors";

type ApiFetchOptions<T> = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Validates the JSON response (INV-2). */
  schema: z.ZodType<T>;
  /** Attach `Authorization: Bearer <jwt>` from the session cookie. Defaults to true. */
  auth?: boolean;
  /**
   * What a 401 on an authenticated call does. `"redirect"` (default) sends the user to
   * `/api/auth/expired`, which clears the cookie and goes to login; `"throw"` raises the
   * `ApiError` like any other status (used by `getSession()`, which treats it as signed out).
   */
  onUnauthorized?: "redirect" | "throw";
};

/**
 * Calls ReNest-Backend from the server (Server Components, Server Actions, Route Handlers).
 * The browser never talks to the backend directly, so the JWT never leaves httpOnly cookies.
 *
 * Reads the session cookie only to attach the Bearer header: `lib/auth/session.ts` owns
 * everything else about the session (INV-5). The redirect on 401 throws, like any
 * `redirect()`: callers that wrap `apiFetch` in `try/catch` must re-throw it
 * (`unstable_rethrow`).
 */
export async function apiFetch<T>(
  path: string,
  { body, schema, auth = true, onUnauthorized = "redirect", headers, ...init }: ApiFetchOptions<T>,
): Promise<T> {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");

  if (auth) {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(new URL(path, serverEnv().API_URL), {
    ...init,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data: unknown =
    response.status === 204 ? undefined : await response.json().catch(() => undefined);

  if (auth && response.status === 401 && onUnauthorized === "redirect") {
    redirect(EXPIRED_SESSION_PATH);
  }
  if (!response.ok) throw new ApiError(response.status, data);

  return schema.parse(data);
}
