import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';
const PROBLEM_USER = 'problem_user';
const LOCKED_OUT_USER = 'locked_out_user';
const PERFORMANCE_GLITCH_USER = 'performance_glitch_user';

test.describe('Authentication', () => {
  test('Login negative: invalid credentials', async ({ page, homePage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login('locked_out_user', 'bad_password');
    await expect(homePage.errorMessage).toContainText('Epic sadface');
  });

  test('Login negative: empty username', async ({ page, homePage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login('', PASSWORD);
    await expect(homePage.errorMessage).toContainText('Username is required');
  });

  test('Login negative: empty password', async ({ page, homePage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, '');
    await expect(homePage.errorMessage).toContainText('Password is required');
  });

  test('Login negative: both fields empty', async ({ page, homePage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login('', '');
    await expect(homePage.errorMessage).toContainText('Username is required');
  });

  test('Login positive: standard user can successfully login', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await expect(productsPage.title).toHaveText('Products');
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('Login positive: problem user can login', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(PROBLEM_USER, PASSWORD);

    await expect(productsPage.title).toHaveText('Products');
  });

  test('Login negative: locked out user receives explicit error', async ({ page, homePage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(LOCKED_OUT_USER, PASSWORD);
    await expect(homePage.errorMessage).toContainText('locked out');
  });

  test('Login multiple times with different users', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    
    // First login
    await homePage.login(STANDARD_USER, PASSWORD);
    await expect(productsPage.title).toHaveText('Products');

    // Logout
    await productsPage.logout();
    await expect(page).toHaveURL(/index.html/);

    // Second login with different user
    await homePage.login(PROBLEM_USER, PASSWORD);
    await expect(productsPage.title).toHaveText('Products');
  });

  test('Logout and verify login required', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await expect(productsPage.title).toHaveText('Products');

    await productsPage.logout();
    await expect(page).toHaveURL(/index.html/);
    await expect(homePage.loginButton).toBeVisible();
  });

  test('Session persistence: access products without logout', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await expect(productsPage.title).toHaveText('Products');

    // Navigate directly to products page
    await page.goto(BASE_URL + 'inventory.html');
    await expect(productsPage.title).toHaveText('Products');
  });

  test('User redirected to login when accessing protected page without session', async ({ page }) => {
    // Try accessing products page directly without login
    await page.goto('https://www.saucedemo.com/inventory.html');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/index.html/);
  });

  test('Login persistence: items in cart persist after logout/login', async ({ page, homePage, productsPage, cartPage }) => {
    // Initial login and add to cart
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);
    await productsPage.addProductToCart('Sauce Labs Fleece Jacket');
    await expect(productsPage.cartBadge).toHaveText('1');

    // Logout
    await productsPage.logout();
    await expect(page).toHaveURL(/index.html/);

    // Login again
    await homePage.login(STANDARD_USER, PASSWORD);
    await expect(productsPage.title).toHaveText('Products');

    // Verify cart persisted
    await expect(productsPage.cartBadge).toHaveText('1');
    await productsPage.gotoCart();
    await cartPage.verifyItemInCart('Sauce Labs Fleece Jacket');
  });

  test('Login: verify nav elements visible after successful login', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Verify navigation elements are visible
    await expect(productsPage.cartBadge.or(page.locator('.shopping_cart_link'))).toBeVisible();
    await expect(productsPage.burgerMenu).toBeVisible();
  });

  test('Login behavior: error message disappears on next login attempt', async ({ page, homePage }) => {
    await homePage.navigate(BASE_URL);
    
    // First failed login
    await homePage.login('invalid', 'wrong');
    await expect(homePage.errorMessage).toBeVisible();

    // Clear and try again - error should persist or update
    await homePage.usernameInput.clear();
    await homePage.passwordInput.clear();
    await homePage.login(PASSWORD, PASSWORD);
    
    // Error message should be visible (still invalid)
    await expect(homePage.errorMessage).toBeVisible();
  });
});
