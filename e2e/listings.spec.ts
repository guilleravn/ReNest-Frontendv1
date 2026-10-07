import { expect, test, type Page } from "@playwright/test";

import { SEEDED_SELLER_STATE_PATH } from "./fixtures";

test.use({ storageState: SEEDED_SELLER_STATE_PATH });

// Runs against ReNest-Backend's Docker stack (`npm run docker:up` in ../ReNest-Backend), signed in
// as the seeded seller (`SEEDED_SELLER_STATE_PATH`, needs E2E_SEED_PASSWORD), whose
// seed gives the current seller exactly one listing per status. The empty and error states can't
// be reached from here (the fetch runs on the server, out of `page.route`'s reach): they are
// covered by the EmptyListings and error.tsx unit tests.
const SEEDED = {
  PENDING: "Reserved office chair",
  ACTIVE: "Wooden dining table",
  COMPLETED: "Sold bookshelf",
} as const;

const statusTabs = (page: Page) =>
  page.getByRole("navigation", { name: "Estado de tus publicaciones" });

const listingsList = (page: Page) => page.getByRole("main").getByRole("list");

test("my listings opens on sales in progress", async ({ page }) => {
  await page.goto("/listings");

  await expect(
    page.getByRole("heading", { level: 1, name: "Lo que estás vendiendo" }),
  ).toBeVisible();
  await expect(statusTabs(page).getByRole("link", { name: "En proceso" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(listingsList(page).getByRole("link")).toHaveCount(1);
  await expect(listingsList(page).getByText(SEEDED.PENDING)).toBeVisible();
  await expect(listingsList(page).getByText("Venta en proceso")).toBeVisible();
});

test("each status tab shows only that status's listings", async ({ page }) => {
  await page.goto("/listings");

  await statusTabs(page).getByRole("link", { name: "Activos" }).click();

  await expect(page).toHaveURL("/listings?status=ACTIVE");
  await expect(statusTabs(page).getByRole("link", { name: "Activos" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(listingsList(page).getByText(SEEDED.ACTIVE)).toBeVisible();
  await expect(listingsList(page).getByRole("link")).toHaveCount(1);
  await expect(page.getByText(SEEDED.PENDING)).toBeHidden();

  await statusTabs(page).getByRole("link", { name: "Completados" }).click();

  await expect(page).toHaveURL("/listings?status=COMPLETED");
  await expect(listingsList(page).getByText(SEEDED.COMPLETED)).toBeVisible();
  await expect(listingsList(page).getByRole("link")).toHaveCount(1);
  await expect(page.getByText(SEEDED.ACTIVE)).toBeHidden();
});

test("an unknown status falls back to sales in progress", async ({ page }) => {
  await page.goto("/listings?status=bogus");

  await expect(statusTabs(page).getByRole("link", { name: "En proceso" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(listingsList(page).getByText(SEEDED.PENDING)).toBeVisible();
});

test("my listings has no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });

  await page.goto("/listings");
  await expect(listingsList(page).getByText(SEEDED.PENDING)).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
