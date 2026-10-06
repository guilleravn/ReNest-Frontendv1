import { expect, test } from "@playwright/test";

import { fillLoginForm, logOutThroughUi, newTestAccount, registerThroughUi } from "./helpers/auth";

// Needs the real ReNest-Backend (`npm run docker:up` in ../ReNest-Backend): these flows create
// accounts and sign in against it.
// Alerts and status messages are matched by text: Next's route announcer is also an alert.

const CREDENTIALS_ERROR = "Correo o contraseña incorrectos";

test("signing up lands on the feed with a welcome toast, shown once", async ({ page }) => {
  const account = newTestAccount();
  const welcome = `¡Cuenta creada! Bienvenido, ${account.fullName}`;

  await registerThroughUi(page, account);

  await expect(page.getByRole("status").filter({ hasText: welcome })).toBeVisible();
  // It auto-dismisses after ~4s; by then the flash cookie has been cleared too.
  await expect(page.getByText(welcome)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Mi cuenta" })).toBeVisible();
  await expect(page.getByText(welcome)).toHaveCount(0);
});

test("signing up with a registered email shows it on the email field", async ({ page }) => {
  const account = await registerThroughUi(page);
  await logOutThroughUi(page);
  await page.goto("/register");

  await page.getByLabel("Nombre").fill("Otra Persona");
  await page.getByLabel("Correo").fill(account.email);
  await page.getByLabel("Tu zona").selectOption("Condesa, CDMX");
  await page.getByLabel("Contraseña").fill("another-pass-1");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page.getByText("Ya existe una cuenta con este correo.")).toBeVisible();
  await expect(page).toHaveURL("/register");
  await expect(page.getByLabel("Tu zona")).toHaveValue("Condesa, CDMX");
});

test("signing in with the right password opens the feed", async ({ page }) => {
  const account = await registerThroughUi(page);
  await logOutThroughUi(page);

  await fillLoginForm(page, account.email, account.password);

  await expect(page).toHaveURL("/feed");
});

test("a wrong password or an unknown email shows the same error", async ({ page }) => {
  const account = await registerThroughUi(page);
  await logOutThroughUi(page);

  await fillLoginForm(page, account.email, "wrong-password");

  await expect(page.getByRole("alert").filter({ hasText: CREDENTIALS_ERROR })).toBeVisible();
  await expect(page).toHaveURL("/login");
  await expect(page.getByLabel("Correo")).toHaveValue(account.email);

  // Fresh page, so the alert below can only come from this second attempt.
  await page.goto("/login");
  await fillLoginForm(page, `unknown-${account.email}`, account.password);

  await expect(page.getByRole("alert").filter({ hasText: CREDENTIALS_ERROR })).toBeVisible();
});

test("a protected route sends a signed-out user to login and back", async ({ page }) => {
  const account = await registerThroughUi(page);
  await logOutThroughUi(page);

  await page.goto("/purchases?status=completed");

  await expect(page).toHaveURL("/login?next=%2Fpurchases%3Fstatus%3Dcompleted");
  await fillLoginForm(page, account.email, account.password);
  await expect(page).toHaveURL("/purchases?status=completed");
});

test("the session survives a reload", async ({ page }) => {
  await registerThroughUi(page);

  await page.reload();

  await expect(page).toHaveURL("/feed");
  await expect(page.getByRole("button", { name: "Mi cuenta" })).toBeVisible();
});

test("signing out returns to login and protects the app again", async ({ page }) => {
  await registerThroughUi(page);

  await logOutThroughUi(page);
  await page.goto("/feed");

  await expect(page).toHaveURL("/login?next=%2Ffeed");
});

test("the auth screens have no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });

  for (const path of ["/login", "/register"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  }
});
