import { expect, test } from "@playwright/test";

const APP = "http://localhost:3000";

test("home renders in the default locale and in the RTL locale", async ({ page }) => {
  await page.goto(`${APP}/en`);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto(`${APP}/fa`);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
});

test("a protected page redirects to sign-in, and signing in opens it", async ({ page }) => {
  await page.goto(`${APP}/en/account`);
  await expect(page).toHaveURL(/\/en\/login\?next=/);
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/account$/);
  await expect(page.getByText("user@example.com")).toBeVisible();
});

test("the reset-password link sets a new password and signs the user in", async ({ page }) => {
  await page.goto(`${APP}/en/reset-password?token=mock-reset-token&email=user%40example.com`);
  await expect(page.getByLabel("Email")).toHaveValue("user@example.com");
  // The mock accepts the same password again, which keeps the other tests' credentials valid.
  await page.getByLabel("New password", { exact: true }).fill("password");
  await page.getByLabel("Confirm password").fill("password");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page).toHaveURL(/\/en\/account$/);
});

test("the proxy refuses a path outside its allow-list, encoded or not", async ({ request }) => {
  for (const path of [
    "api/v1/auth/login",
    "api/v1/examples/..%2fauth/login",
    "api/v1/examples/%2e%2e/auth/login",
  ]) {
    const response = await request.get(`${APP}/api/backend/${path}`);
    expect(response.status(), path).toBe(404);
  }
});
