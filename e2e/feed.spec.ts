import { expect, test, type Page } from "@playwright/test";

// Runs against ReNest-Backend's Docker stack (`npm run docker:up` in ../ReNest-Backend). Its seed
// publishes ACTIVE listings that include the ones below (SEED_FEED_LISTING_IDS in the backend's
// prisma/seed-fixtures.ts); "armchair" matches exactly two of them. The error and empty-feed
// states can't be reached from here (the fetch runs on the server, out of `page.route`'s reach):
// they are covered by the ErrorBoundary, error.tsx and EmptyFeed unit tests.
const SEEDED = {
  leatherArmchair: "Leather armchair",
  oakArmchair: "Oak armchair",
  deskLamp: "Desk lamp",
} as const;

const searchBox = (page: Page) => page.getByRole("searchbox", { name: "Buscar por título" });

const feedList = (page: Page) => page.getByRole("main").getByRole("list");

test("the feed lists the published items", async ({ page }) => {
  await page.goto("/feed");

  await expect(
    page.getByRole("heading", { level: 1, name: "Encuentra algo con historia" }),
  ).toBeVisible();
  for (const title of Object.values(SEEDED)) {
    await expect(feedList(page).getByText(title)).toBeVisible();
  }
  await expect(page.getByText(/^\d+ resultados?$/)).toBeVisible();
});

test("typing narrows the feed to matching titles", async ({ page }) => {
  await page.goto("/feed");
  await expect(feedList(page).getByText(SEEDED.deskLamp)).toBeVisible();

  await searchBox(page).fill("armchair");

  await expect(page).toHaveURL("/feed?q=armchair");
  await expect(feedList(page).getByRole("link")).toHaveCount(2);
  await expect(feedList(page).getByText(SEEDED.leatherArmchair)).toBeVisible();
  await expect(feedList(page).getByText(SEEDED.oakArmchair)).toBeVisible();
  await expect(page.getByText(SEEDED.deskLamp)).toBeHidden();
  await expect(page.getByText("2 resultados")).toBeVisible();
});

test("a search with no matches says so", async ({ page }) => {
  await page.goto("/feed");

  await searchBox(page).fill("zzzz-no-match");
  await searchBox(page).press("Enter");

  await expect(page).toHaveURL("/feed?q=zzzz-no-match");
  await expect(page.getByRole("status")).toContainText("Todavía no hay coincidencias");
  await expect(page.getByRole("status")).toContainText(
    "Ningún artículo con “zzzz-no-match”. Prueba con otra palabra.",
  );
  const main = page.getByRole("main");
  await expect(main.getByText("Todavía no hay coincidencias", { exact: true })).toBeVisible();
  await expect(
    main.getByText("Ningún artículo con “zzzz-no-match”. Prueba con otra palabra.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(main.getByRole("link", { name: "Limpiar búsqueda" })).toBeVisible();
});

test("the no-match state's link clears the search and restores the feed", async ({ page }) => {
  await page.goto("/feed?q=zzzz-no-match");

  await page.getByRole("main").getByRole("link", { name: "Limpiar búsqueda" }).click();

  await expect(page).toHaveURL("/feed");
  await expect(searchBox(page)).toHaveValue("");
  await expect(feedList(page).getByText(SEEDED.deskLamp)).toBeVisible();
});

test("leaving a search before its debounce fires does not bring it back", async ({ page }) => {
  await page.clock.install();
  await page.goto("/feed?q=armchair");
  await expect(feedList(page).getByRole("link")).toHaveCount(2);
  // Freeze page timers so the debounced search can't fire before the logo click.
  await page.clock.pauseAt(Date.now() + 1000);

  await searchBox(page).pressSequentially("s");
  await page.getByRole("link", { name: "Inicio de ReNest" }).click();
  await expect(page).toHaveURL("/feed");
  await page.clock.runFor(1000); // well past the debounce
  await page.clock.resume(); // React also needs timers to reveal the new results

  // A stale search would land as `?q=armchairs` (no desk lamp) after the logo's `/feed`.
  await expect(feedList(page).getByText(SEEDED.deskLamp)).toBeVisible();
  await expect(page).toHaveURL("/feed");
  await expect(searchBox(page)).toHaveValue("");
});

test("clearing the search restores the full feed", async ({ page }) => {
  await page.goto("/feed?q=armchair");
  await expect(page.getByText(SEEDED.deskLamp)).toBeHidden();

  await page.getByRole("button", { name: "Limpiar búsqueda" }).click();

  await expect(page).toHaveURL("/feed");
  await expect(searchBox(page)).toHaveValue("");
  await expect(searchBox(page)).toBeFocused();
  await expect(feedList(page).getByText(SEEDED.deskLamp)).toBeVisible();
  await expect(feedList(page).getByText(SEEDED.oakArmchair)).toBeVisible();
});

test("the field keeps focus and text while the results update under it", async ({ page }) => {
  await page.goto("/feed");

  await searchBox(page).pressSequentially("arm");
  await expect(page).toHaveURL("/feed?q=arm");
  await expect(feedList(page).getByRole("link")).toHaveCount(2);
  await searchBox(page).pressSequentially("chair");

  await expect(page).toHaveURL("/feed?q=armchair");
  await expect(searchBox(page)).toBeFocused();
  await expect(searchBox(page)).toHaveValue("armchair");
});

test("going back to the feed from the home link drops the search everywhere", async ({ page }) => {
  await page.goto("/feed?q=armchair");
  await expect(feedList(page).getByRole("link")).toHaveCount(2);

  // On phones the tab bar is at the bottom; the logo link goes to the feed on every width.
  await page.getByRole("link", { name: "Inicio de ReNest" }).click();

  await expect(page).toHaveURL("/feed");
  await expect(feedList(page).getByText(SEEDED.deskLamp)).toBeVisible();
  await expect(searchBox(page)).toHaveValue("");
});

test("browser back restores the previous search in the field and the results", async ({ page }) => {
  await page.goto("/feed?q=armchair");
  await page.getByRole("link", { name: "Inicio de ReNest" }).click();
  await expect(page).toHaveURL("/feed");

  await page.goBack();

  await expect(page).toHaveURL("/feed?q=armchair");
  await expect(feedList(page).getByRole("link")).toHaveCount(2);
  await expect(searchBox(page)).toHaveValue("armchair");
});

test("returning from an item keeps the search", async ({ page }) => {
  await page.goto("/feed?q=armchair");

  await feedList(page)
    .getByRole("link", { name: new RegExp(SEEDED.oakArmchair) })
    .click();
  await expect(page).toHaveURL(/\/items\//);
  await page.goBack();

  await expect(page).toHaveURL("/feed?q=armchair");
  await expect(searchBox(page)).toHaveValue("armchair");
  await expect(feedList(page).getByRole("link")).toHaveCount(2);
});

test("the search field shows a focus ring when reached by keyboard", async ({ page }) => {
  await page.goto("/feed");
  await searchBox(page).focus();
  await page.keyboard.press("Shift+Tab");

  await page.keyboard.press("Tab");

  await expect(searchBox(page)).toBeFocused();
  // WCAG 2.4.7 / accessibility.md: a visible focus ring, not just a subtle border tint.
  await expect(searchBox(page)).not.toHaveCSS("outline-style", "none");
});

test("one persistent status region announces each search's outcome", async ({ page }) => {
  await page.goto("/feed");
  const status = page.getByRole("status");
  await expect(status).toHaveText(/^\d+ artículos encontrados\.$/);
  const region = await status.elementHandle();

  await searchBox(page).fill("armchair");
  await expect(status).toHaveText("2 artículos encontrados.");

  await searchBox(page).fill("zzzz-no-match");
  await expect(status).toContainText("Todavía no hay coincidencias");

  // Same element throughout: a live region re-inserted on every search would go unannounced.
  expect(await region?.evaluate((el) => el.isConnected)).toBe(true);
  await expect(page.getByRole("status")).toHaveCount(1);
});

test("a deep link opens the feed already filtered", async ({ page }) => {
  await page.goto("/feed?q=armchair");

  await expect(searchBox(page)).toHaveValue("armchair");
  await expect(feedList(page).getByRole("link")).toHaveCount(2);
  await expect(feedList(page).getByText(SEEDED.leatherArmchair)).toBeVisible();
});

test("the feed has no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });

  await page.goto("/feed");
  await expect(feedList(page).getByText(SEEDED.leatherArmchair)).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
