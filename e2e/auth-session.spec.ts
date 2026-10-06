import type { BrowserContext, Page } from "@playwright/test";

import { expect, signedInTest, test } from "./fixtures";
import { fillLoginForm, logOutThroughUi, newTestAccount, registerThroughUi } from "./helpers/auth";

// Session, redirect and form-hardening checks for A9. Needs the real ReNest-Backend
// (`npm run docker:up` in ../ReNest-Backend), like auth.spec.ts. Tests that only need a
// signed-in user share the worker account (`signedInTest`); see auth.spec.ts.

const SESSION_COOKIE = "renest_token";
const FLASH_COOKIE = "renest_flash";
const DAY_SECONDS = 24 * 60 * 60;

async function getCookie(context: BrowserContext, name: string) {
  return (await context.cookies()).find((cookie) => cookie.name === name);
}

async function setBogusSession(context: BrowserContext) {
  await context.addCookies([
    { name: SESSION_COOKIE, value: "not-a-valid-jwt", url: "http://localhost:3001" },
  ]);
}

/**
 * Submits the visible form and returns the Server Action's response body. The POST goes through
 * `page.route`, which reads the body from the network itself: Chromium may discard a response
 * body before `response.text()` runs (e.g. once a production build starts prefetching links).
 */
async function submitAndReadResponse(page: Page, buttonName: string) {
  let resolveBody: (body: string) => void = () => {};
  const body = new Promise<string>((resolve) => {
    resolveBody = resolve;
  });
  await page.route("**/*", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    const response = await route.fetch();
    const text = await response.text();
    resolveBody(text);
    await route.fulfill({ response, body: text });
  });

  await page.getByRole("button", { name: buttonName }).click();
  const text = await body;
  await page.unrouteAll({ behavior: "wait" });
  return text;
}

test.describe("session cookie", () => {
  test("is httpOnly, lax, site-wide and expires with the token", async ({ page, context }) => {
    await registerThroughUi(page);

    const cookie = await getCookie(context, SESSION_COOKIE);

    expect(cookie).toBeDefined();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
    expect(cookie?.path).toBe("/");
    // A persistent cookie (~7 days, as the token), not a session-only one.
    const secondsLeft = (cookie?.expires ?? 0) - Date.now() / 1000;
    expect(secondsLeft).toBeGreaterThan(6 * DAY_SECONDS);
    expect(secondsLeft).toBeLessThan(8 * DAY_SECONDS);
  });

  test("never reaches the page's JavaScript or HTML (INV-1)", async ({ page, context }) => {
    const account = await registerThroughUi(page);
    await logOutThroughUi(page);
    const actionBodies: string[] = [];
    page.on("response", async (response) => {
      if (response.request().method() !== "POST") return;
      actionBodies.push(await response.text().catch(() => ""));
    });

    await fillLoginForm(page, account.email, account.password);
    await expect(page).toHaveURL("/feed");

    const token = (await getCookie(context, SESSION_COOKIE))?.value;
    expect(token).toBeTruthy();
    expect(await page.evaluate(() => document.cookie)).not.toContain(SESSION_COOKIE);
    expect(await page.content()).not.toContain(token);
    expect(actionBodies.join("\n")).not.toContain(token);
  });

  signedInTest("is removed by signing out", async ({ page, context }) => {
    await page.goto("/feed");

    await logOutThroughUi(page);

    expect(await getCookie(context, SESSION_COOKIE)).toBeUndefined();
  });
});

test.describe("stale session", () => {
  test("a rejected cookie on a protected page ends on login and is cleared", async ({
    page,
    context,
  }) => {
    await setBogusSession(context);

    await page.goto("/feed");

    await expect(page).toHaveURL("/login?next=%2Ffeed");
    await expect(page.getByRole("heading", { level: 1, name: "Inicia sesión" })).toBeVisible();
    expect(await getCookie(context, SESSION_COOKIE)).toBeUndefined();
  });

  test("a rejected cookie on login doesn't loop between login and the feed", async ({
    page,
    context,
  }) => {
    await setBogusSession(context);

    await page.goto("/login");

    await expect(page).toHaveURL("/login?next=%2Ffeed");
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    expect(await getCookie(context, SESSION_COOKIE)).toBeUndefined();
  });

  signedInTest(
    "a session rejected during client navigation sends the user to login",
    async ({ page, context }) => {
      await page.goto("/feed");
      await setBogusSession(context);

      // "Mis compras" lives in the (detail) layout, which checks the session again.
      await page.getByRole("link", { name: /Mis compras/ }).click();

      await expect(page).toHaveURL("/login?next=%2Fpurchases");
      expect(await getCookie(context, SESSION_COOKIE)).toBeUndefined();
    },
  );

  test("ignores a page-path header sent by the client", async ({ page, context }) => {
    await setBogusSession(context);
    // The proxy must overwrite it with the real page before any server code reads it.
    await page.setExtraHTTPHeaders({ "x-renest-page-path": "/listings" });

    await page.goto("/purchases");

    await expect(page).toHaveURL("/login?next=%2Fpurchases");
  });
});

test.describe("expired-session handler", () => {
  signedInTest(
    "can't sign out a valid session (e.g. from a link on another site)",
    async ({ page, context }) => {
      const token = (await getCookie(context, SESSION_COOKIE))?.value;

      await page.goto("/api/auth/expired?next=%2Flistings", {
        referer: "https://evil.example/",
      });

      await expect(page).toHaveURL("/listings");
      expect((await getCookie(context, SESSION_COOKIE))?.value).toBe(token);
    },
  );

  test("never sends the user back to a Route Handler", async ({ page, context }) => {
    await setBogusSession(context);

    await page.goto("/api/auth/expired?next=%2Fapi%2Fauth%2Fexpired");

    await expect(page).toHaveURL("/login");
    expect(await getCookie(context, SESSION_COOKIE)).toBeUndefined();
  });
});

test.describe("redirect after login", () => {
  for (const next of ["//evil.example/feed", "/\\evil.example", "https://evil.example/"]) {
    test(`ignores the unsafe next ${next}`, async ({ page }) => {
      const account = await registerThroughUi(page);
      await logOutThroughUi(page);
      await page.goto(`/login?next=${encodeURIComponent(next)}`);

      await fillLoginForm(page, account.email, account.password);

      await expect(page).toHaveURL("/feed");
    });
  }

  test("re-validates a tampered next field on the server", async ({ page }) => {
    const account = await registerThroughUi(page);
    await logOutThroughUi(page);
    await page.locator("form").evaluate((form) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "next";
      input.value = "//evil.example/steal";
      form.append(input);
    });

    await fillLoginForm(page, account.email, account.password);

    await expect(page).toHaveURL("/feed");
  });
});

test.describe("login form", () => {
  test("never sends the password back to the browser", async ({ page }) => {
    const account = await registerThroughUi(page);
    await logOutThroughUi(page);
    const wrongPassword = "wrong-password-echo-check";
    await page.getByLabel("Correo").fill(account.email);
    await page.getByLabel("Contraseña").fill(wrongPassword);

    const responseBody = await submitAndReadResponse(page, "Entrar");

    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
    // The action state really came back (an empty body would pass trivially).
    expect(responseBody).toContain('"status":"error"');
    expect(responseBody).not.toContain(wrongPassword);
    await expect(page.getByLabel("Contraseña")).toHaveValue("");
  });

  test("shows the rate-limit message after too many attempts", async ({ page }) => {
    const email = newTestAccount().email;
    await page.goto("/login");

    // The backend allows 5 attempts per email per minute; the 6th gets a 429.
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await page.getByLabel("Correo").fill(email);
      await page.getByLabel("Contraseña").fill("wrong-password");
      await page.getByRole("button", { name: "Entrar" }).click();
      // React resets the form once the action settles (the password has no default value).
      await expect(page.getByLabel("Contraseña")).toHaveValue("");
    }

    await expect(
      page.getByText("Demasiados intentos. Espera un minuto e intenta de nuevo."),
    ).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("login password", () => {
  test("an over-length password gets a field error, not a connection error", async ({ page }) => {
    await page.goto("/login");
    // Only reachable by bypassing the input's maxLength.
    await page.getByLabel("Contraseña").evaluate((input) => input.removeAttribute("maxlength"));

    await fillLoginForm(page, newTestAccount().email, "a".repeat(129));

    await expect(page.getByText("Revisa los datos e intenta de nuevo.")).toBeVisible();
    await expect(page.getByText("No pudimos conectar con ReNest. Intenta de nuevo.")).toHaveCount(
      0,
    );
  });
});

test.describe("sign-up form", () => {
  test("shows every field error and focuses the first invalid field", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    for (const message of [
      "Ingresa tu nombre",
      "Correo no válido",
      "Elige tu zona para coordinar recogidas",
      "La contraseña debe tener al menos 8 caracteres",
    ]) {
      await expect(page.getByText(message)).toBeVisible();
    }
    await expect(page.getByLabel("Nombre")).toBeFocused();
    await expect(page.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Nombre")).toHaveAccessibleDescription("Ingresa tu nombre");
    await expect(page).toHaveURL("/register");
  });

  test("rejects an invalid phone and keeps the other values", async ({ page }) => {
    const account = newTestAccount();
    await page.goto("/register");
    await page.getByLabel("Nombre").fill(account.fullName);
    await page.getByLabel("Correo").fill(account.email);
    const [zone] = await page.getByLabel("Tu zona").selectOption({ index: 1 });
    await page.getByLabel("Teléfono").fill("12345");
    await page.getByLabel("Contraseña").fill(account.password);

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.getByText("Teléfono no válido")).toBeVisible();
    await expect(page.getByLabel("Teléfono")).toBeFocused();
    await expect(page.getByLabel("Nombre")).toHaveValue(account.fullName);
    await expect(page.getByLabel("Tu zona")).toHaveValue(zone ?? "");
    await expect(page.getByLabel("Contraseña")).toHaveValue("");
  });

  test("shows a zone the backend doesn't offer on the zone field", async ({ page }) => {
    const account = newTestAccount();
    await page.goto("/register");
    // Simulates a zone the backend dropped after the page loaded.
    await page.getByLabel("Tu zona").evaluate((select) => {
      select.append(new Option("Atlántida, Mar", "Atlántida, Mar"));
    });
    await page.getByLabel("Nombre").fill(account.fullName);
    await page.getByLabel("Correo").fill(account.email);
    await page.getByLabel("Tu zona").selectOption("Atlántida, Mar");
    await page.getByLabel("Contraseña").fill(account.password);

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.getByLabel("Tu zona")).toHaveAccessibleDescription(
      /Elige tu zona para coordinar recogidas/,
    );
    await expect(page.getByLabel("Tu zona")).toBeFocused();
    // Back on the placeholder, not silently on another zone.
    await expect(page.getByLabel("Tu zona")).toHaveValue("");
    await expect(page).toHaveURL("/register");
  });

  test("lists the zones the backend offers", async ({ page, request }) => {
    const zones: string[] = await (await request.get("http://localhost:3000/zones")).json();

    await page.goto("/register");

    await expect(page.getByLabel("Tu zona").locator("option:not([disabled])")).toHaveText(zones);
  });

  test("accepts a phone typed with spaces", async ({ page }) => {
    const account = newTestAccount();
    await page.goto("/register");
    await page.getByLabel("Nombre").fill(account.fullName);
    await page.getByLabel("Correo").fill(account.email);
    await page.getByLabel("Tu zona").selectOption({ index: 1 });
    await page.getByLabel("Teléfono").fill("+52 55 1234 5678");
    await page.getByLabel("Contraseña").fill(account.password);

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page).toHaveURL("/feed");
  });

  test("renders the welcome toast as text and clears the flash cookie", async ({
    page,
    context,
  }) => {
    const account = { ...newTestAccount(), fullName: '<img src=x onerror="window.__xss=1">' };

    await registerThroughUi(page, account);

    await expect(
      page
        .getByRole("status")
        .filter({ hasText: `¡Cuenta creada! Bienvenido, ${account.fullName}` }),
    ).toBeVisible();
    expect(await page.evaluate(() => "__xss" in window)).toBe(false);
    await expect.poll(async () => getCookie(context, FLASH_COOKIE)).toBeUndefined();
  });
});

test.describe("account menu", () => {
  signedInTest("works with the keyboard", async ({ page, workerAccount }) => {
    await page.goto("/feed");
    const trigger = page.getByRole("button", { name: "Mi cuenta" });

    await trigger.focus();
    await page.keyboard.press("Enter");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(workerAccount.email)).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
