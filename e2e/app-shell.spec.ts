import { expect, test } from "@playwright/test";

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("tab pages show the header and the top tab bar", async ({ page }) => {
    await page.goto("/feed");

    await expect(page.getByRole("link", { name: "Inicio de ReNest" })).toBeVisible();
    await expect(page.getByRole("link", { name: /mis compras/i })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Principal" }).filter({ visible: true });
    await expect(nav.getByRole("link", { name: /inicio/i })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await nav.getByRole("link", { name: /mis artículos/i }).click();
    await expect(page).toHaveURL(/\/listings$/);
    await expect(nav.getByRole("link", { name: /mis artículos/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("secondary pages have no tab bar", async ({ page }) => {
    await page.goto("/purchases");

    await expect(page.getByRole("link", { name: "Inicio de ReNest" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(0);
  });

  test("purchases page switches tabs through the URL", async ({ page }) => {
    await page.goto("/purchases");

    await expect(page.getByRole("heading", { name: "Recogidas y compras" })).toBeVisible();
    const tabs = page.getByRole("navigation", { name: "Estado de las compras" });
    await expect(tabs.getByRole("link", { name: "Agendadas" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await tabs.getByRole("link", { name: "Completadas" }).click();
    await expect(page).toHaveURL(/\/purchases\?tab=completadas$/);
    await expect(tabs.getByRole("link", { name: "Completadas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("no count badges are shown without backend data", async ({ page }) => {
    await page.goto("/feed");

    await expect(page.getByRole("link", { name: "Mis compras", exact: true })).toBeVisible();
    await expect(page.getByText(/^\d+$/)).toHaveCount(0);
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("tab pages show the bottom tab bar", async ({ page }) => {
    await page.goto("/feed");

    const nav = page.getByRole("navigation", { name: "Principal" }).filter({ visible: true });
    await expect(nav).toHaveCount(1);
    await expect(nav.getByRole("link", { name: /inicio/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("secondary pages show a back link to the feed", async ({ page }) => {
    await page.goto("/purchases");

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/feed$/);
  });
});
