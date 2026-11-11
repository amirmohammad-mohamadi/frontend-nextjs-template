import { expect, test } from "@playwright/test";

// Smoke tests of the `example` reference domain. `npm run example:remove` deletes this file.

const APP = "http://localhost:3000";

test("the examples list loads from the mock API and opens a detail page", async ({ page }) => {
  await page.goto(`${APP}/en/examples`);
  const first = page.getByRole("list").getByRole("listitem").first();
  await expect(first).toBeVisible();
  await first.getByRole("link").click();
  await expect(page).toHaveURL(/\/en\/examples\/\d+$/);
  await expect(page.getByText("Created:")).toBeVisible();
});

test("the status filter and the search narrow the list through the URL", async ({ page }) => {
  await page.goto(`${APP}/en/examples?status=archived`);
  const items = page.getByRole("list").getByRole("listitem");
  await expect(items.first()).toBeVisible();
  await expect(items.first().getByText("Archived")).toBeVisible();
  await expect(items.getByText("Draft")).toHaveCount(0);

  await page.goto(`${APP}/en/examples`);
  await page.getByLabel("Search").fill("getting");
  await expect(page).toHaveURL(/search=getting/);
  await expect(items).toHaveCount(1);
});
