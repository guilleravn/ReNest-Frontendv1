import { describe, expect, it } from "vitest";

import { getPagePath, getRouteRedirect } from "./route-access";

describe("getRouteRedirect", () => {
  it("sends a signed-out user on a protected route to login with the page as next", () => {
    expect(getRouteRedirect({ pagePath: "/items/i1?from=feed", hasSessionCookie: false })).toBe(
      "/login?next=%2Fitems%2Fi1%3Ffrom%3Dfeed",
    );
  });

  it("sends a signed-out user on the root to login without next", () => {
    expect(getRouteRedirect({ pagePath: "/", hasSessionCookie: false })).toBe("/login");
  });

  it.each(["/login", "/register", "/login?next=%2Ffeed"])(
    "lets a signed-out user open %s",
    (pagePath) => {
      expect(getRouteRedirect({ pagePath, hasSessionCookie: false })).toBeNull();
    },
  );

  it.each(["/login", "/register?next=%2Flistings"])(
    "sends a signed-in user on %s to the feed",
    (pagePath) => {
      expect(getRouteRedirect({ pagePath, hasSessionCookie: true })).toBe("/feed");
    },
  );

  it.each(["/feed", "/purchases", "/listings/new"])("lets a signed-in user open %s", (pagePath) => {
    expect(getRouteRedirect({ pagePath, hasSessionCookie: true })).toBeNull();
  });

  it("does not treat paths that only start like a public one as public", () => {
    expect(getRouteRedirect({ pagePath: "/login-help", hasSessionCookie: false })).toBe(
      "/login?next=%2Flogin-help",
    );
  });

  it("does not carry an /api path as next", () => {
    expect(getRouteRedirect({ pagePath: "/api/zones", hasSessionCookie: false })).toBe("/login");
  });
});

describe("getPagePath", () => {
  it("keeps the path and the query string", () => {
    expect(getPagePath(new URL("http://localhost/purchases?status=completed"))).toBe(
      "/purchases?status=completed",
    );
  });

  it("drops Next's _rsc parameter from client navigations", () => {
    expect(getPagePath(new URL("http://localhost/purchases?status=completed&_rsc=1x2y"))).toBe(
      "/purchases?status=completed",
    );
    expect(getPagePath(new URL("http://localhost/feed?_rsc=abc"))).toBe("/feed");
  });
});
