import { expect, test } from "@playwright/test";

test("root redirects to the feed", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/feed$/);
  await expect(page).toHaveTitle("ReNest");
});
