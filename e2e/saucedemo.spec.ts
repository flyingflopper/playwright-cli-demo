import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('SauceDemo critical flows (POM)', () => {
  test('Login negative: invalid credentials', async ({ page, homePage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login('locked_out_user', 'bad_password');
    await expect(homePage.errorMessage).toContainText('Epic sadface');
  });

  test('Login positive + add product to cart + checkout', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await expect(productsPage.title).toHaveText('Products');
    await productsPage.addProductToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.verifyItemInCart('Sauce Labs Backpack');
    await cartPage.checkout();

    await checkoutPage.fillCheckoutInfo('Jane', 'Doe', '90210');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('Required field enforcement at checkout', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await productsPage.gotoCart();
    await cartPage.checkout();

    // Trigger required field validation
    await checkoutPage.continueButton.click({ force: true });
    await expect(page).toHaveURL(/checkout-step-one.html/);
  });

  test('Remove item from cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Bolt T-Shirt');
    await productsPage.addProductToCart('Sauce Labs Onesie');
    await expect(productsPage.cartBadge).toHaveText('2');

    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    await cartPage.removeItemFromCart('Sauce Labs Onesie');
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.verifyItemInCart('Sauce Labs Bolt T-Shirt');
  });

  test('Sort products by price (low to high)', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.sortBy('lohi');
    await page.waitForTimeout(500);

    const prices = await productsPage.getProductPrices();
    // Verify prices are sorted in ascending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  test('Sort products by price (high to low)', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.sortBy('hilo');
    await page.waitForTimeout(500);

    const prices = await productsPage.getProductPrices();
    // Verify prices are sorted in descending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  test('Logout and verify login required', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await expect(productsPage.title).toHaveText('Products');

    await productsPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(homePage.loginButton).toBeVisible();
  });

  test('Login persistence: items in cart persist after logout/login', async ({ page, homePage, productsPage, cartPage }) => {
    // Initial login and add to cart
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);
    await productsPage.addProductToCart('Sauce Labs Fleece Jacket');
    await expect(productsPage.cartBadge).toHaveText('1');

    // Logout
    await productsPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Login again
    await homePage.login(STANDARD_USER, PASSWORD);
    await expect(productsPage.title).toHaveText('Products');

    // Verify cart persisted
    await expect(productsPage.cartBadge).toHaveText('1');
    await productsPage.gotoCart();
    await cartPage.verifyItemInCart('Sauce Labs Fleece Jacket');
  });

  test('Multiple products add/remove cart flow', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const products = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
    ];

    // Add all products
    for (const product of products) {
      await productsPage.addProductToCart(product);
    }
    await expect(productsPage.cartBadge).toHaveText('3');

    // Go to cart and verify
    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(3);

    // Remove one product
    await cartPage.removeItemFromCart('Sauce Labs Bike Light');
    await expect(cartPage.cartItems).toHaveCount(2);

    // Continue shopping and verify badge updated
    await cartPage.continueShopping();
    await expect(productsPage.cartBadge).toHaveText('2');
  });
});
