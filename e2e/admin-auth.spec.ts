import { expect, test, type APIResponse, type Page } from "@playwright/test";

import { baseURL, sameOriginHeaders } from "./request";

const localAdmin = {
  email: process.env.BLOGCMS_LOCAL_ADMIN_EMAIL ?? "a@a.test",
  password: process.env.BLOGCMS_LOCAL_ADMIN_PASSWORD ?? "1",
};

const adminRoutes = [
  { path: "/admin", heading: "Admin overview" },
  { path: "/admin/comments", heading: "Comments" },
  { path: "/admin/users", heading: "Users" },
] as const;

test.describe("Admin authentication", () => {
  test("rejects anonymous access to admin UI and APIs", async ({ page, request }) => {
    const meResponse = await request.get(
      "/api/admin/me?disableCookieCache=true&disableRefresh=true",
    );
    expect(meResponse.status()).toBe(401);

    const usersResponse = await request.get("/api/admin/users");
    expect(usersResponse.status()).toBe(401);

    const pageResponse = await page.goto("/admin", { waitUntil: "domcontentloaded" });
    expect(pageResponse?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
  });

  test("logs in as the local admin and loads core admin pages", async ({ page }) => {
    await logInAsLocalAdmin(page);

    const meResponse = await page
      .context()
      .request.get("/api/admin/me?disableCookieCache=true&disableRefresh=true");
    expect(meResponse.status()).toBe(200);
    await expectAdminPayload(meResponse);

    const usersResponse = await page.context().request.get("/api/admin/users");
    expect(usersResponse.status()).toBe(200);

    for (const route of adminRoutes) {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route.path} should not return a server error`).toBeLessThan(
        500,
      );
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
    }
  });

  test("shows a denied admin state for signed-in readers", async ({ page }) => {
    await prepareEmailPasswordSignup(page);

    const runId = `${Date.now()}-${test.info().parallelIndex}`;
    await signUpReaderAccount(page, {
      email: `reader-admin-denied-${runId}@example.test`,
      name: `Reader Admin Denied ${runId}`,
      password: "password123",
    });

    const accountResponse = await page
      .context()
      .request.get("/api/account/me?disableCookieCache=true&disableRefresh=true");
    expect(accountResponse.status()).toBe(200);

    const adminMeResponse = await page
      .context()
      .request.get("/api/admin/me?disableCookieCache=true&disableRefresh=true");
    expect(adminMeResponse.status()).toBe(401);

    const usersResponse = await page.context().request.get("/api/admin/users");
    expect(usersResponse.status()).toBe(401);

    const response = await page.goto("/admin", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole("heading", { name: "Admin area unavailable" })).toBeVisible();
    await expect(page.getByText("This account does not have admin access.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin overview" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Posts/ })).toHaveCount(0);
  });

  test("keeps the public header in account state after login", async ({ page }) => {
    await logInAsLocalAdmin(page);

    const accountResponse = await page
      .context()
      .request.get("/api/account/me?disableCookieCache=true&disableRefresh=true");
    expect(accountResponse.status()).toBe(200);

    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(500);

    const header = page.locator("header");
    const accountButton = header.getByRole("button", { name: "Account" });

    await expect(accountButton).toBeVisible();
    await expect(header.getByRole("button", { name: "Login" })).toHaveCount(0);

    for (let index = 0; index < 3; index += 1) {
      await accountButton.hover();
      await page.waitForTimeout(150);
      await expect(accountButton).toBeVisible();
      await expect(header.getByRole("button", { name: "Login" })).toHaveCount(0);
    }
  });

  test("logs in with the native form fallback", async ({ browser }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator('form[action="/api/account/login"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
    await page.locator("#email").fill(localAdmin.email);
    await page.locator("#password").fill(localAdmin.password);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/app\/?$/);
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
    await page.getByRole("button", { name: /Open admin/ }).click();
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole("heading", { name: "Admin overview" })).toBeVisible();

    await context.close();
  });

  test("signs out of the admin shell", async ({ page }) => {
    await logInAsLocalAdmin(page);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();

    const meResponse = await page
      .context()
      .request.get("/api/admin/me?disableCookieCache=true&disableRefresh=true");
    expect(meResponse.status()).toBe(401);
  });
});

async function logInAsLocalAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(localAdmin.email);
  await page.getByLabel("Password").fill(localAdmin.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/app\/?$/);
  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
  await page.getByRole("button", { name: /Open admin/ }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("heading", { name: "Admin overview" })).toBeVisible();
}

async function prepareEmailPasswordSignup(page: Page) {
  await page.context().clearCookies();
}

async function signUpReaderAccount(
  page: Page,
  input: {
    email: string;
    name: string;
    password: string;
  },
) {
  const signupResponse = await page.context().request.post("/api/account/signup", {
    data: input,
    headers: sameOriginHeaders(),
  });
  expect(signupResponse.status()).toBe(201);

  await page.goto("/app", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
}

async function expectAdminPayload(response: APIResponse) {
  const payload = (await response.json()) as {
    data?: {
      email?: string;
      role?: string;
    };
  };

  expect(payload.data).toMatchObject({
    email: localAdmin.email,
    role: "admin",
  });
}
