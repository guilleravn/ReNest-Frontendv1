import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApiError } from "@/lib/api/errors";

import { getAuthErrorKind, isFieldRejected } from "./form-state";

describe("getAuthErrorKind", () => {
  it.each([
    [401, "invalidCredentials"],
    [409, "emailTaken"],
    [429, "tooManyAttempts"],
    [400, "invalidInput"],
    [403, "invalidInput"],
    [422, "invalidInput"],
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

describe("isFieldRejected", () => {
  const badRequest = (message: unknown) =>
    new ApiError(400, { statusCode: 400, message, error: "Bad Request" });

  it("detects a Nest validation message about the field", () => {
    expect(
      isFieldRejected(badRequest(["city must be one of the following values: …"]), "city"),
    ).toBe(true);
    expect(isFieldRejected(badRequest("city should not be empty"), "city")).toBe(true);
  });

  it("ignores messages about other fields or other statuses", () => {
    expect(isFieldRejected(badRequest(["cityName must be a string"]), "city")).toBe(false);
    expect(isFieldRejected(badRequest(["email must be an email"]), "city")).toBe(false);
    expect(isFieldRejected(new ApiError(409, { message: "city taken" }), "city")).toBe(false);
    expect(isFieldRejected(badRequest(undefined), "city")).toBe(false);
    expect(isFieldRejected(new Error("city boom"), "city")).toBe(false);
  });
});
