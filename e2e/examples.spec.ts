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
  await expect(page.getByRole("list").getByRole("listitem").first()).toBeVisible();
  for (const badge of await page.getByRole("list").getByText("Archived").all()) {
    await expect(badge).toBeVisible();
  }
  await page.getByLabel("Search").fill("getting");
  await expect(page).toHaveURL(/search=getting/);
  await expect(page.getByRole("list").getByRole("listitem")).toHaveCount(1);
});
