import { expect, signedInTest as test } from "./fixtures";

const isMobile = () => test.info().project.name === "mobile";

// Every shell route needs a session: tests start signed in as the worker account (needs the real
// backend, see auth.spec.ts). The login test clears it first.

test("the root URL opens the feed", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL("/feed");
  await expect(
    page.getByRole("heading", { level: 1, name: "Encuentra algo con historia" }),
  ).toBeVisible();
});

test("the tab navigation switches between the feed and my listings", async ({ page }) => {
  await page.goto("/feed");
  const nav = page.getByRole("navigation", { name: "Principal" });

  await nav.getByRole("link", { name: /Mis artículos/ }).click();

  // Only the shell is asserted here: the page content needs the backend (see listings.spec.ts).
  await expect(page).toHaveURL("/listings");
  await expect(nav.getByRole("link", { name: /Mis artículos/ })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await nav.getByRole("link", { name: "Inicio" }).click();

  await expect(page).toHaveURL("/feed");
});

test("my purchases opens without the tab navigation", async ({ page }) => {
  await page.goto("/feed");

  await page.getByRole("link", { name: /Mis compras/ }).click();

  await expect(page).toHaveURL("/purchases");
  await expect(page.getByRole("heading", { level: 1, name: "Recogidas y compras" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
});

test("detail pages go back to their parent", async ({ page }) => {
  await page.goto("/items/i1/pickup");

  if (isMobile()) {
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL("/items/i1");
  } else {
    // Desktop has no back link; the logo leads home.
    await expect(page.getByRole("link", { name: "Volver" })).toBeHidden();
    await page.getByRole("link", { name: "Inicio de ReNest" }).click();
    await expect(page).toHaveURL("/feed");
  }
});

test("the login page renders outside the app shell", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/login");

  await expect(page.getByRole("heading", { level: 1, name: "Inicia sesión" })).toBeVisible();
  await expect(page.getByRole("banner")).toHaveCount(0);
});

test("the shell has no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });

  await page.goto("/feed");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test("my purchases switches between scheduled and completed through the URL", async ({ page }) => {
  await page.goto("/purchases");
  const tabs = page.getByRole("navigation", { name: "Estado de las compras" });
  await expect(tabs.getByRole("link", { name: "Agendadas" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await tabs.getByRole("link", { name: "Completadas" }).click();

  await expect(page).toHaveURL("/purchases?status=completed");
  await expect(tabs.getByRole("link", { name: "Completadas" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
