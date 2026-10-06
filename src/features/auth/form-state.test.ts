import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApiError } from "@/lib/api/errors";

import { getAuthErrorKind } from "./form-state";

describe("getAuthErrorKind", () => {
  it.each([
    [401, "invalidCredentials"],
    [409, "emailTaken"],
    [429, "tooManyAttempts"],
    [400, "unavailable"],
    [500, "unavailable"],
    [503, "unavailable"],
  ] as const)("maps a %i response to %s", (status, kind) => {
    expect(getAuthErrorKind(new ApiError(status, undefined))).toBe(kind);
  });

  it("treats an unreachable backend as unavailable", () => {
    expect(getAuthErrorKind(new TypeError("fetch failed"))).toBe("unavailable");
  });

  it("leaves other errors to be re-thrown", () => {
    const contractError = z.string().safeParse(1).error;

    expect(getAuthErrorKind(contractError)).toBeNull();
    expect(getAuthErrorKind(new Error("boom"))).toBeNull();
  });
});
