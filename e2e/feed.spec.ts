import { expect, test, type Page } from "@playwright/test";

// Runs against ReNest-Backend's Docker stack (`npm run docker:up` in ../ReNest-Backend), whose
// seed gives 3 categories and 2 feed-visible listings, both currently categorized as furniture.
// The global-empty-feed state (zero listings at all) can't be reached from here: covered by the
// EmptyFeed unit tests.
const SEEDED = {
  LAMP: "Another seller's lamp",
  TABLE: "Wooden dining table",
} as const;

const categoryChips = (page: Page) => page.getByRole("navigation", { name: "Categorías" });
const feedList = (page: Page) => page.getByRole("main").getByRole("list");

test("feed opens with every category unselected and all listings shown", async ({ page }) => {
  await page.goto("/feed");

  await expect(
    page.getByRole("heading", { level: 1, name: "Encuentra algo con historia" }),
  ).toBeVisible();
  await expect(categoryChips(page).getByRole("link")).toHaveCount(3);
  for (const link of await categoryChips(page).getByRole("link").all()) {
    await expect(link).not.toHaveAttribute("aria-current", "page");
  }
  await expect(feedList(page).getByText(SEEDED.LAMP)).toBeVisible();
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
});

test("selecting a category filters the feed, and selecting it again clears it", async ({
  page,
}) => {
  await page.goto("/feed");

  await categoryChips(page).getByRole("link", { name: "Muebles" }).click();

  await expect(page).toHaveURL("/feed?category=furniture");
  await expect(categoryChips(page).getByRole("link", { name: "Muebles" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();

  await categoryChips(page).getByRole("link", { name: "Muebles" }).click();

  await expect(page).toHaveURL("/feed");
  await expect(categoryChips(page).getByRole("link", { name: "Muebles" })).not.toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
});

test("a category with no listings shows its own empty message", async ({ page }) => {
  await page.goto("/feed");

  await categoryChips(page).getByRole("link", { name: "Electrónica" }).click();

  await expect(page).toHaveURL("/feed?category=electronics");
  await expect(page.getByText("No hay artículos en esta categoría por ahora.")).toBeVisible();
});

test("a category combined with a search with no matches names both filters (BO-6)", async ({
  page,
}) => {
  await page.goto("/feed?category=furniture");

  await page.getByLabel("Buscar artículos").fill("no-such-item-zzz");
  await page.waitForURL("/feed?category=furniture&search=no-such-item-zzz");

  await expect(
    page.getByText("No encontramos artículos que coincidan con tu búsqueda en esta categoría."),
  ).toBeVisible();
});

test("feed has no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });

  await page.goto("/feed");
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

// ReNest-Backend rejects `search` longer than 100 characters with a 400. A pasted long term must
// not replace the whole feed (search box included) with an error the user can't recover from.
test("an over-long search keeps the feed and the search box usable", async ({ page }) => {
  await page.goto("/feed");

  await page.getByLabel("Buscar artículos").fill("a".repeat(101));
  await page.waitForURL(/search=a+/);

  await expect(
    page.getByText("No encontramos artículos que coincidan con tu búsqueda."),
  ).toBeVisible();
  await expect(page.getByLabel("Buscar artículos")).toBeVisible();
});

test("going back restores the search box to the URL's search term", async ({ page }) => {
  await page.goto("/feed");
  await categoryChips(page).getByRole("link", { name: "Muebles" }).click();
  await expect(page).toHaveURL("/feed?category=furniture");
  await page.getByLabel("Buscar artículos").fill("no-such-item-zzz");
  await page.waitForURL("/feed?category=furniture&search=no-such-item-zzz");

  await page.goBack();

  await expect(page).toHaveURL("/feed");
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
  await expect(page.getByLabel("Buscar artículos")).toHaveValue("");
});

// Pausing after a space lets the debounce navigate to the trimmed term; the field must not then
// re-sync to it and eat the space the user is about to type after ("wooden table").
test("pausing after a space while typing keeps the space in the search box", async ({ page }) => {
  await page.goto("/feed");
  // Keystrokes sent before hydration are wiped when React takes over the input: wait for the
  // streamed results (rendered after hydration starts) before typing character by character.
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
  const searchBox = page.getByLabel("Buscar artículos");

  await searchBox.pressSequentially("wooden ");
  await page.waitForURL("/feed?search=wooden");
  await searchBox.pressSequentially("table");

  await expect(searchBox).toHaveValue("wooden table");
  await page.waitForURL("/feed?search=wooden+table");
});

// The header logo links to bare `/feed`, which re-renders the same (still mounted) search box.
// Going back to the term the box itself sent earlier is an external URL change like any other:
// the box must show it again, matching the results it filters by.
test("going back to a term typed earlier shows it again after leaving via the logo", async ({
  page,
}) => {
  await page.goto("/feed");
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
  const searchBox = page.getByLabel("Buscar artículos");

  await searchBox.fill("wooden");
  await page.waitForURL("/feed?search=wooden");
  await page.getByRole("link", { name: "Inicio de ReNest" }).click();
  await expect(page).toHaveURL("/feed");
  await expect(searchBox).toHaveValue("");

  await page.goBack();

  await expect(page).toHaveURL("/feed?search=wooden");
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
  await expect(feedList(page).getByText(SEEDED.LAMP)).toBeHidden();
  await expect(searchBox).toHaveValue("wooden");
});

// Back and forth between two terms the box sent itself, then typing straight away: every history
// step re-syncs the box, and the fresh typing still searches what was typed (trailing-space safe).
test("typing right after moving back and forth between two typed terms searches the new text", async ({
  page,
}) => {
  await page.goto("/feed");
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
  const searchBox = page.getByLabel("Buscar artículos");

  await searchBox.fill("wooden");
  await page.waitForURL("/feed?search=wooden");
  await page.getByRole("link", { name: "Inicio de ReNest" }).click();
  await expect(page).toHaveURL("/feed");
  await searchBox.fill("lamp");
  await page.waitForURL("/feed?search=lamp");

  await page.goBack();
  await expect(page).toHaveURL("/feed?search=wooden");
  await expect(searchBox).toHaveValue("wooden");
  await page.goForward();
  await expect(page).toHaveURL("/feed?search=lamp");
  await expect(searchBox).toHaveValue("lamp");
  await page.goBack();
  await expect(page).toHaveURL("/feed?search=wooden");
  await expect(searchBox).toHaveValue("wooden");

  await searchBox.press("End");
  await searchBox.pressSequentially(" ");
  // Wait out the debounce: the trimmed term is unchanged, so the URL must stay as it is.
  await page.waitForTimeout(600);
  await expect(page).toHaveURL("/feed?search=wooden");
  await searchBox.pressSequentially("dining");

  await page.waitForURL("/feed?search=wooden+dining");
  await expect(searchBox).toHaveValue("wooden dining");
  await expect(feedList(page).getByText(SEEDED.TABLE)).toBeVisible();
  await expect(feedList(page).getByText(SEEDED.LAMP)).toBeHidden();
});
