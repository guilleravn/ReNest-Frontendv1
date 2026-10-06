import { describe, expect, it } from "vitest";

import { isSafeRedirectPath, safeRedirectPath, withNextParam } from "./redirect-path";

describe("safeRedirectPath", () => {
  it.each(["/feed", "/items/i1", "/purchases?status=completed", "/listings/l1#photos"])(
    "keeps the internal path %s",
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  it.each([
    ["a protocol-relative URL", "//evil.com"],
    ["a backslash host", "/\\evil.com"],
    ["an absolute URL", "https://evil.com/feed"],
    ["a relative path", "feed"],
    ["an empty string", ""],
    ["a path with a tab", "/\t/evil.com"],
    ["a path with a newline", "/\n/evil.com"],
    ["a path with a carriage return", "/\r/evil.com"],
    ["a path with a leading space", "/ /evil.com"],
    ["a path with a NUL byte", "/\u0000/evil.com"],
    ["a path with DEL", "/\u007f/evil.com"],
    ["a backslash first", "\\\\evil.com"],
    ["a backslash then a slash", "/\\/evil.com"],
    ["a javascript: URL", "javascript:alert(1)"],
    ["a scheme-relative URL with credentials", "//user@evil.com"],
  ])("falls back to the feed for %s", (_label, path) => {
    expect(safeRedirectPath(path)).toBe("/feed");
  });

  it.each([
    // Still-encoded slashes stay a path segment on this host: the browser never decodes them
    // into a host.
    "/%2F%2Fevil.com",
    "/%5Cevil.com",
    "/..//evil.com",
  ])("keeps %s, which resolves on this host", (path) => {
    expect(safeRedirectPath(path)).toBe(path);
    expect(new URL(path, "https://renest.app").host).toBe("renest.app");
  });

  it.each([undefined, null, 42, ["/feed"]])("falls back to the feed for %j", (value) => {
    expect(safeRedirectPath(value)).toBe("/feed");
  });
});

describe("isSafeRedirectPath", () => {
  it("accepts internal paths only", () => {
    expect(isSafeRedirectPath("/listings")).toBe(true);
    expect(isSafeRedirectPath("//listings")).toBe(false);
  });
});

describe("safeRedirectPath and /api", () => {
  it.each([
    "/api",
    "/api/auth/expired",
    "/api/auth/expired?next=%2Ffeed",
    "/API/zones",
    "/api?x=1",
  ])("falls back to the feed for the Route Handler path %s", (path) => {
    expect(safeRedirectPath(path)).toBe("/feed");
  });

  it.each(["/./api/auth/expired", "/feed/../api/auth/expired", "/%2e/api/auth/expired"])(
    "falls back to the feed for %s, which the browser resolves under /api",
    (path) => {
      expect(new URL(path, "https://renest.app").pathname.startsWith("/api/")).toBe(true);
      expect(safeRedirectPath(path)).toBe("/feed");
    },
  );

  it.each(["/apiary", "/listings/api"])("keeps %s, which is not under /api", (path) => {
    expect(safeRedirectPath(path)).toBe(path);
  });
});

describe("withNextParam", () => {
  it("appends a safe next", () => {
    expect(withNextParam("/login", "/purchases?status=completed")).toBe(
      "/login?next=%2Fpurchases%3Fstatus%3Dcompleted",
    );
  });

  it.each([null, undefined, "/", "//evil.com", "/api/auth/expired"])(
    "leaves the path alone for %j",
    (next) => {
      expect(withNextParam("/login", next)).toBe("/login");
    },
  );
});
