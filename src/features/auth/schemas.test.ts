import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  authTokenSchema,
  loginSchema,
  normalizePhone,
  registerSchema,
  sessionUserSchema,
  zonesSchema,
} from "./schemas";

function fieldErrorsOf(result: { error?: z.ZodError }) {
  return result.error ? z.flattenError(result.error).fieldErrors : {};
}

describe("normalizePhone", () => {
  it("strips spaces, hyphens, dots and parentheses", () => {
    expect(normalizePhone(" +52 (55) 1234-56.78 ")).toBe("+525512345678");
  });

  it("keeps an already normalized number", () => {
    expect(normalizePhone("+5491123456789")).toBe("+5491123456789");
  });
});

describe("loginSchema", () => {
  it("accepts an email and a password, trimming the email", () => {
    expect(loginSchema.parse({ email: " camila@renest.app ", password: "x" })).toEqual({
      email: "camila@renest.app",
      password: "x",
    });
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "camila", password: "secret123" });

    expect(fieldErrorsOf(result)).toEqual({ email: ["Correo no válido"] });
  });

  it.each([{ password: "" }, {}])("asks for the password when it is empty (%j)", (password) => {
    const result = loginSchema.safeParse({ email: "a@b.co", ...password });

    expect(fieldErrorsOf(result)).toEqual({ password: ["Ingresa tu contraseña"] });
  });
});

describe("registerSchema", () => {
  const valid = {
    fullName: "  Camila Torres ",
    email: "camila@renest.app",
    city: "Palermo, Buenos Aires",
    phoneE164: "+54 9 11 2345-6789",
    password: "secret123",
  };

  it("turns the form values into the backend payload", () => {
    expect(registerSchema.parse(valid)).toEqual({
      fullName: "Camila Torres",
      email: "camila@renest.app",
      city: "Palermo, Buenos Aires",
      phoneE164: "+5491123456789",
      password: "secret123",
    });
  });

  it.each([undefined, "", "  ", " - "])(
    "sends a null phone when it is left blank (%j)",
    (phone) => {
      expect(registerSchema.parse({ ...valid, phoneE164: phone }).phoneE164).toBeNull();
    },
  );

  it.each([
    ["fullName", { fullName: " C " }, "Ingresa tu nombre"],
    ["fullName", { fullName: "a".repeat(121) }, "Ingresa tu nombre"],
    ["fullName", { fullName: undefined }, "Ingresa tu nombre"],
    ["email", { email: "camila@" }, "Correo no válido"],
    ["email", { email: `${"a".repeat(250)}@b.com` }, "Correo no válido"],
    ["city", { city: undefined }, "Elige tu zona para coordinar recogidas"],
    ["city", { city: "   " }, "Elige tu zona para coordinar recogidas"],
    ["phoneE164", { phoneE164: "5512345678" }, "Teléfono no válido"],
    ["phoneE164", { phoneE164: "+0 55 1234 5678" }, "Teléfono no válido"],
    ["phoneE164", { phoneE164: "+52 123" }, "Teléfono no válido"],
    ["phoneE164", { phoneE164: "+52 55 1234 5678 9012" }, "Teléfono no válido"],
    ["password", { password: "short" }, "La contraseña debe tener al menos 8 caracteres"],
    ["password", { password: "a".repeat(129) }, "La contraseña debe tener al menos 8 caracteres"],
  ])("rejects an invalid %s (%j)", (field, override, message) => {
    const result = registerSchema.safeParse({ ...valid, ...override });

    expect(fieldErrorsOf(result)).toEqual({ [field]: [message] });
  });
});

describe("authTokenSchema", () => {
  it("accepts a token with an ISO 8601 UTC expiry", () => {
    const result = authTokenSchema.safeParse({
      accessToken: "jwt",
      expiresAt: "2026-10-13T12:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it.each([
    { accessToken: "", expiresAt: "2026-10-13T12:00:00Z" },
    { accessToken: "jwt", expiresAt: "next week" },
  ])("rejects an empty token or a non-ISO expiry (%j)", (token) => {
    expect(authTokenSchema.safeParse(token).success).toBe(false);
  });
});

describe("sessionUserSchema", () => {
  const user = {
    id: "01927b2e-8f3a-7c4d-9e5f-0a1b2c3d4e5f",
    email: "camila@renest.app",
    fullName: "Camila Torres",
    city: "Palermo, Buenos Aires",
    phoneE164: null,
    isVerified: true,
  };

  it("accepts the current user, with or without a phone", () => {
    expect(sessionUserSchema.parse(user)).toEqual(user);
    expect(sessionUserSchema.parse({ ...user, phoneE164: "+5491123456789" }).phoneE164).toBe(
      "+5491123456789",
    );
  });

  it("rejects a user without the verification flag", () => {
    expect(sessionUserSchema.safeParse({ ...user, isVerified: undefined }).success).toBe(false);
  });

  it.each(["u1", 42])("rejects an id that is not a UUID (%j)", (id) => {
    expect(sessionUserSchema.safeParse({ ...user, id }).success).toBe(false);
  });
});

describe("loginSchema password limit", () => {
  it("rejects a password longer than the backend accepts", () => {
    const result = loginSchema.safeParse({ email: "a@b.co", password: "a".repeat(129) });

    expect(fieldErrorsOf(result)).toEqual({ password: ["Revisa los datos e intenta de nuevo."] });
  });

  it("accepts a 128-character password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "a".repeat(128) }).success).toBe(
      true,
    );
  });
});

describe("registerSchema city", () => {
  it("accepts any non-empty zone: the backend checks it against GET /zones", () => {
    const result = registerSchema.safeParse({
      fullName: "Camila Torres",
      email: "camila@renest.app",
      city: "Usaquén, Bogotá",
      password: "secret123",
    });

    expect(result.data?.city).toBe("Usaquén, Bogotá");
    expect(result.data).not.toHaveProperty("acceptedTerms");
  });
});

describe("zonesSchema", () => {
  it("accepts a non-empty list of zone names", () => {
    expect(zonesSchema.parse(["Condesa, CDMX", "Miraflores, Lima"])).toEqual([
      "Condesa, CDMX",
      "Miraflores, Lima",
    ]);
  });

  it.each([[[]], [["Condesa, CDMX", ""]], [["  "]], [[1]], [{}]])("rejects %j", (zones) => {
    expect(zonesSchema.safeParse(zones).success).toBe(false);
  });
});
