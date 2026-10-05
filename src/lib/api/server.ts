import "server-only";
import { cookies } from "next/headers";
import type { z } from "zod";

import { serverEnv } from "@/lib/env";

import { ApiError } from "./errors";

/** httpOnly cookie that holds the backend JWT. Set by the (future) login flow. */
export const AUTH_COOKIE = "renest_token";

type ApiFetchOptions<T> = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Validates the JSON response. Strongly recommended for every call. */
  schema?: z.ZodType<T>;
  /** Attach `Authorization: Bearer <jwt>` from the auth cookie. Defaults to true. */
  auth?: boolean;
};

/**
 * Calls ReNest-Backend from the server (Server Components, Server Actions, Route Handlers).
 * The browser never talks to the backend directly, so the JWT never leaves httpOnly cookies.
 */
export async function apiFetch<T = unknown>(
  path: string,
  { body, schema, auth = true, headers, ...init }: ApiFetchOptions<T> = {},
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

  if (!response.ok) throw new ApiError(response.status, data);

  return schema ? schema.parse(data) : (data as T);
}
