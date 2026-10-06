import { describe, expect, it } from "vitest";

import { getRouteRedirect } from "./route-access";

describe("getRouteRedirect", () => {
  it("sends a signed-out user on a protected route to login with the path as next", () => {
    expect(
      getRouteRedirect({ pathname: "/items/i1", search: "?from=feed", hasSessionCookie: false }),
    ).toBe("/login?next=%2Fitems%2Fi1%3Ffrom%3Dfeed");
  });

  it("sends a signed-out user on the root to login without next", () => {
    expect(getRouteRedirect({ pathname: "/", search: "", hasSessionCookie: false })).toBe("/login");
  });

  it.each(["/login", "/register"])("lets a signed-out user open %s", (pathname) => {
    expect(getRouteRedirect({ pathname, search: "", hasSessionCookie: false })).toBeNull();
  });

  it.each(["/login", "/register"])("sends a signed-in user on %s to the feed", (pathname) => {
    expect(
      getRouteRedirect({ pathname, search: "?next=%2Flistings", hasSessionCookie: true }),
    ).toBe("/feed");
  });

  it.each(["/feed", "/purchases", "/listings/new"])("lets a signed-in user open %s", (pathname) => {
    expect(getRouteRedirect({ pathname, search: "", hasSessionCookie: true })).toBeNull();
  });

  it("does not treat paths that only start like a public one as public", () => {
    expect(getRouteRedirect({ pathname: "/login-help", search: "", hasSessionCookie: false })).toBe(
      "/login?next=%2Flogin-help",
    );
  });
});
