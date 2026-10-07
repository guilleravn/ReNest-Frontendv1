import { test as setup } from "@playwright/test";

import { readSeedPassword, SEEDED_SELLER_EMAIL, SEEDED_SELLER_STATE_PATH } from "./fixtures";
import { fillLoginForm } from "./helpers/auth";

setup("sign in as the seeded seller", async ({ page }) => {
  await page.goto("/login");
  await fillLoginForm(page, SEEDED_SELLER_EMAIL, readSeedPassword());
  await page.waitForURL("/feed");

  await page.context().storageState({ path: SEEDED_SELLER_STATE_PATH });
});
