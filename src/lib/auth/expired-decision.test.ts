import { describe, expect, it } from "vitest";

import { decideExpiredAction } from "./expired-decision";

const user = { id: "u1" };

describe("decideExpiredAction", () => {
  it("goes to login with next for a rejected cookie, even after a previous hop", () => {
    expect(
      decideExpiredAction({ next: "/listings", user: null, previousHop: "/listings" }),
    ).toEqual({ kind: "login", to: "/login?next=%2Flistings" });
  });

  it("continues to next for a valid session and records the hop", () => {
    expect(decideExpiredAction({ next: "/listings", user, previousHop: undefined })).toEqual({
      kind: "continue",
      to: "/listings",
      hop: "/listings",
    });
  });

  it("continues when the backend is unreachable (the page's error boundary explains)", () => {
    expect(decideExpiredAction({ next: "/feed", user: "unknown", previousHop: undefined })).toEqual(
      { kind: "continue", to: "/feed", hop: "/feed" },
    );
  });

  it("stops with the error page when the same next comes back within the window", () => {
    expect(decideExpiredAction({ next: "/listings", user, previousHop: "/listings" })).toEqual({
      kind: "error",
      to: "/session-error",
    });
  });

  it("does not trip for a different page", () => {
    expect(decideExpiredAction({ next: "/purchases", user, previousHop: "/listings" }).kind).toBe(
      "continue",
    );
  });

  it("guards the fallback destination too", () => {
    expect(decideExpiredAction({ next: "//evil.example", user, previousHop: "/feed" }).kind).toBe(
      "error",
    );
  });
});
