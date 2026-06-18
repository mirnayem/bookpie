import { expect, test, type Page } from "@playwright/test";

const adminUser = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
  createdAt: new Date().toISOString(),
};

async function mockAdminApi(page: Page) {
  await page.route("**/api/v1/admin/dashboard/summary", (route) =>
    route.fulfill({ json: { success: true, data: { totalCustomers: 4, totalBooks: 8, totalOrders: 3, pendingOrders: 1, lowStockBooks: 2, paidRevenue: 4200 }, error: null } }),
  );
  await page.route("**/api/v1/admin/orders**", (route) =>
    route.fulfill({ json: { success: true, data: [{ id: "22222222-2222-2222-2222-222222222222", userId: adminUser.id, addressId: null, status: "pending", paymentProvider: "bkash", paymentStatus: "pending", subtotal: 500, shippingFee: 80, discountTotal: 0, total: 580, items: [{ bookId: "33333333-3333-3333-3333-333333333333", title: "Test Book", quantity: 1, unitPrice: 500, lineTotal: 500 }], delivery: null, createdAt: new Date().toISOString() }], error: null } }),
  );
  await page.route("**/api/v1/admin/inventory**", (route) =>
    route.fulfill({ json: { success: true, data: [{ bookId: "33333333-3333-3333-3333-333333333333", title: "Test Book", slug: "test-book", coverImageUrl: null, stock: 2 }], error: null } }),
  );
  await page.route("**/api/v1/books**", (route) =>
    route.fulfill({ json: { success: true, data: [{ id: "33333333-3333-3333-3333-333333333333", title: "Test Book", slug: "test-book", description: null, author: { id: "44444444-4444-4444-4444-444444444444", name: "Test Author", slug: "test-author" }, publisher: { id: "55555555-5555-5555-5555-555555555555", name: "Test Publisher", slug: "test-publisher" }, categories: [{ id: "66666666-6666-6666-6666-666666666666", name: "Fiction", slug: "fiction" }], price: 600, salePrice: 500, stock: 2, coverImageUrl: null }], error: null } }),
  );
  await page.route("**/api/v1/authors", (route) =>
    route.fulfill({ json: { success: true, data: [{ id: "44444444-4444-4444-4444-444444444444", name: "Test Author", slug: "test-author" }], error: null } }),
  );
  await page.route("**/api/v1/publishers", (route) =>
    route.fulfill({ json: { success: true, data: [{ id: "55555555-5555-5555-5555-555555555555", name: "Test Publisher", slug: "test-publisher" }], error: null } }),
  );
  await page.route("**/api/v1/categories", (route) =>
    route.fulfill({ json: { success: true, data: [{ id: "66666666-6666-6666-6666-666666666666", name: "Fiction", slug: "fiction" }], error: null } }),
  );
}

async function seedAdminSession(page: Page) {
  await page.addInitScript((user) => {
    window.localStorage.setItem("bookpie-auth", JSON.stringify({ state: { user, tokens: { accessToken: "access", refreshToken: "refresh" } }, version: 0 }));
  }, adminUser);
}

test.beforeEach(async ({ page }) => {
  await mockAdminApi(page);
  await seedAdminSession(page);
});

test("admin dashboard renders without horizontal overflow", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasOverflow).toBe(false);
});

test("product create form opens from products page", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "Products", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add product" }).click();
  await expect(page.getByRole("heading", { name: "Create product" })).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
});

test("order management dialog opens", async ({ page }) => {
  await page.goto("/admin/orders");
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(page.getByRole("heading", { name: /Order #/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Delivery assignment" })).toBeVisible();
});
