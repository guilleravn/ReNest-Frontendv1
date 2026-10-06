import { expect, type Page } from "@playwright/test";

export type TestAccount = {
  fullName: string;
  email: string;
  password: string;
};

/** A fresh account per call, so specs don't depend on seeded users or on each other. */
export function newTestAccount(): TestAccount {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { fullName: "Camila Prueba", email: `e2e-${id}@renest.test`, password: "secret-pass-1" };
}

/** Signs up through the UI and waits for the feed. */
export async function registerThroughUi(page: Page, account: TestAccount = newTestAccount()) {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill(account.fullName);
  await page.getByLabel("Correo").fill(account.email);
  await page.getByLabel("Tu zona").selectOption("Palermo, Buenos Aires");
  await page.getByLabel("Contraseña").fill(account.password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL("/feed");
  return account;
}

/** Signs in through the UI (from wherever the login form currently is). */
export async function fillLoginForm(page: Page, email: string, password: string) {
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

/** Opens the account menu in the header and signs out. */
export async function logOutThroughUi(page: Page) {
  await page.getByRole("button", { name: "Mi cuenta" }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/login");
}
