// @vitest-environment node
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "./proxy";

const ORIGIN = "http://localhost:3001";

function runProxy(path: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(`${ORIGIN}${path}`);
  for (const [name, value] of Object.entries(cookies)) request.cookies.set(name, value);
  return proxy(request);
}

describe("proxy matcher", () => {
  it.each(["/", "/feed", "/listings/l1", "/purchases?status=completed", "/login", "/register"])(
    "runs on the page %s",
    (path) => {
      expect(unstable_doesMiddlewareMatch({ config, url: path })).toBe(true);
    },
  );

  it.each([
    "/_next/static/chunks/main.js",
    "/_next/image?url=%2Fbrand%2Flogo.svg&w=128&q=75",
    "/brand/logo-horizontal.svg",
    "/favicon.ico",
    "/api/auth/expired",
  ])("skips %s, so assets and the expired-session handler never redirect", (path) => {
    expect(unstable_doesMiddlewareMatch({ config, url: path })).toBe(false);
  });
});

describe("proxy", () => {
  it("sends a request without the session cookie to login, keeping the path as next", () => {
    const response = runProxy("/listings/l1?tab=photos");

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${ORIGIN}/login?next=%2Flistings%2Fl1%3Ftab%3Dphotos`,
    );
  });

  it("lets a request with the session cookie through, without validating it", () => {
    const response = runProxy("/feed", { renest_token: "not-a-real-jwt" });

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("sends a signed-in user away from login to the feed", () => {
    const response = runProxy("/login?next=%2F%2Fevil.example", { renest_token: "token" });

    expect(response.headers.get("location")).toBe(`${ORIGIN}/feed`);
  });

  it("lets a signed-out user open the sign-up page", () => {
    const response = runProxy("/register");

    expect(response.headers.get("location")).toBeNull();
  });
});
