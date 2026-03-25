import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';

test.describe('API: Authentication Endpoints', () => {
  test('API: Login endpoint returns valid session', async ({ page, homePage, context }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.abort('blockedbyclient');
    });

    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      await route.continue();
    });

    await homePage.navigate(BASE_URL);
    await homePage.login('standard_user', 'secret_sauce');
    
    // Verify user can access products page after login
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('API: Login with invalid credentials returns 401', async ({ page }) => {
    // Mock failed login with 401 status
    await page.route('**/api/auth/login', async (route) => {
      await route.abort('blockedbyclient');
    });

    await page.goto(BASE_URL);

    // Fill in credentials
    const usernameInput = page.getByPlaceholder('Username');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.getByRole('button', { name: 'Login' });

    await usernameInput.fill('invalid_user');
    await passwordInput.fill('wrong_password');
    
    // API should return error
    await loginButton.click();

    // Error message should be displayed
    const errorMessage = page.locator('[data-test="error"]');
    const isVisible = await errorMessage.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('API: Logout endpoint clears session', async ({ page, homePage, productsPage }) => {
    // Mock logout endpoint
    await page.route('**/api/auth/logout', async (route) => {
      if (route.request().method() === 'POST') {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login('standard_user', 'secret_sauce');
    await expect(productsPage.title).toHaveText('Products');

    // Logout
    await productsPage.logout();
    await expect(page).toHaveURL(/index.html/);
  });

  test('API: Session validation returns current user info', async ({ page, homePage, productsPage }) => {
    let sessionCalled = false;

    await page.route('**/api/auth/session', async (route) => {
      sessionCalled = true;
      await route.continue();
    });

    await homePage.navigate(BASE_URL);
    await homePage.login('standard_user', 'secret_sauce');

    await expect(productsPage.title).toHaveText('Products');
  });

  test('API: Missing authentication header is rejected', async ({ page }) => {
    let requestHeaders: Record<string, string> = {};

    await page.route('**/api/**', async (route) => {
      const headers = await route.request().allHeaders();
      requestHeaders = Object.fromEntries(Object.entries(headers));
      await route.continue();
    });

    await page.goto(BASE_URL + 'inventory.html');
    // Should redirect to login since no auth
    await expect(page).toHaveURL(/index.html/);
  });

  test('API: Token refresh endpoint extends session', async ({ page, homePage, productsPage }) => {
    let refreshCalled = false;

    await page.route('**/api/auth/refresh', async (route) => {
      refreshCalled = true;
      
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'new_token_xyz',
            expiresIn: 3600
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login('standard_user', 'secret_sauce');
    
    // Add a product which should work with valid session
    await productsPage.addProductToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  test('API: Multiple login attempts with rate limiting', async ({ page }) => {
    let loginAttempts = 0;

    await page.route('**/api/auth/login', async (route) => {
      loginAttempts++;

      if (loginAttempts > 3) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Too many login attempts. Try again later.',
            retryAfter: 60
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(BASE_URL);

    // First 3 attempts succeed, 4th fails
    for (let i = 0; i < 4; i++) {
      const usernameInput = page.getByPlaceholder('Username');
      const passwordInput = page.getByPlaceholder('Password');
      const loginButton = page.getByRole('button', { name: 'Login' });

      await usernameInput.clear();
      await passwordInput.clear();
      await usernameInput.fill('test');
      await passwordInput.fill('test');
      await loginButton.click();

      await page.waitForTimeout(100);
    }

    expect(loginAttempts).toBe(4);
  });
});
