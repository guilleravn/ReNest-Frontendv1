import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import { fillLoginForm, logOutThroughUi, newTestAccount, registerThroughUi } from "./helpers/auth";

// Session, redirect and form-hardening checks for A9. Needs the real ReNest-Backend
// (`npm run docker:up` in ../ReNest-Backend), like auth.spec.ts.

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

/** Submits the visible form and waits for the Server Action's response. */
async function submitAndWait(page: Page, buttonName: string) {
  const [response] = await Promise.all([
    page.waitForResponse((res) => res.request().method() === "POST"),
    page.getByRole("button", { name: buttonName }).click(),
  ]);
  return response;
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

  test("is removed by signing out", async ({ page, context }) => {
    await registerThroughUi(page);

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

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { level: 1, name: "Inicia sesión" })).toBeVisible();
    expect(await getCookie(context, SESSION_COOKIE)).toBeUndefined();
  });

  test("a rejected cookie on login doesn't loop between login and the feed", async ({
    page,
    context,
  }) => {
    await setBogusSession(context);

    await page.goto("/login");

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    expect(await getCookie(context, SESSION_COOKIE)).toBeUndefined();
  });

  test("a session rejected during client navigation sends the user to login", async ({
    page,
    context,
  }) => {
    await registerThroughUi(page);
    await setBogusSession(context);

    // "Mis compras" lives in the (detail) layout, which checks the session again.
    await page.getByRole("link", { name: /Mis compras/ }).click();

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

    const response = await submitAndWait(page, "Entrar");

    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
    expect(await response.text()).not.toContain(wrongPassword);
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

test.describe("sign-up form", () => {
  test("shows every field error and focuses the first invalid field", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    for (const message of [
      "Ingresa tu nombre",
      "Correo no válido",
      "Elige tu zona para coordinar recogidas",
      "La contraseña debe tener al menos 8 caracteres",
      "Acepta los Términos y la Política de privacidad",
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
    await page.getByLabel("Tu zona").selectOption("Miraflores, Lima");
    await page.getByLabel("Teléfono").fill("12345");
    await page.getByLabel("Contraseña").fill(account.password);
    await page.getByRole("checkbox").check();

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.getByText("Teléfono no válido")).toBeVisible();
    await expect(page.getByLabel("Teléfono")).toBeFocused();
    await expect(page.getByLabel("Nombre")).toHaveValue(account.fullName);
    await expect(page.getByLabel("Tu zona")).toHaveValue("Miraflores, Lima");
    await expect(page.getByRole("checkbox")).toBeChecked();
    await expect(page.getByLabel("Contraseña")).toHaveValue("");
  });

  test("accepts a phone typed with spaces", async ({ page }) => {
    const account = newTestAccount();
    await page.goto("/register");
    await page.getByLabel("Nombre").fill(account.fullName);
    await page.getByLabel("Correo").fill(account.email);
    await page.getByLabel("Tu zona").selectOption("Roma Norte, CDMX");
    await page.getByLabel("Teléfono").fill("+52 55 1234 5678");
    await page.getByLabel("Contraseña").fill(account.password);
    await page.getByRole("checkbox").check();

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
  test("works with the keyboard", async ({ page }) => {
    const account = await registerThroughUi(page);
    const trigger = page.getByRole("button", { name: "Mi cuenta" });

    await trigger.focus();
    await page.keyboard.press("Enter");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(account.email)).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
