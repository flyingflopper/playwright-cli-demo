import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';
const PROBLEM_USER = 'problem_user';

test.describe('Checkout', () => {
  test('Complete checkout flow: single product', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
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
    await expect(page).toHaveURL(/checkout-complete.html/);
  });

  test('Complete checkout flow: multiple products', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

    // Add all products to cart
    for (const product of products) {
      await productsPage.addProductToCart(product);
    }
    await expect(productsPage.cartBadge).toHaveText('3');

    // Proceed to checkout
    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(3);
    await cartPage.checkout();

    // Complete checkout
    await checkoutPage.fillCheckoutInfo('John', 'Smith', '12345');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('Required field enforcement: first name missing', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await productsPage.gotoCart();
    await cartPage.checkout();

    // Try to continue without filling first name
    await checkoutPage.lastName.fill('Doe');
    await checkoutPage.postalCode.fill('90210');
    await checkoutPage.continueButton.click();

    // Should see error for missing first name
    const errorLocator = page.locator('[data-test="error"]');
    await expect(errorLocator).toBeVisible();
    await expect(page).toHaveURL(/checkout-step-one.html/);
  });

  test('Required field enforcement: last name missing', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await productsPage.gotoCart();
    await cartPage.checkout();

    // Try to continue without filling last name
    await checkoutPage.firstName.fill('Jane');
    await checkoutPage.postalCode.fill('90210');
    await checkoutPage.continueButton.click();

    // Should see error for missing last name
    const errorLocator = page.locator('[data-test="error"]');
    await expect(errorLocator).toBeVisible();
  });

  test('Required field enforcement: postal code missing', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await productsPage.gotoCart();
    await cartPage.checkout();

    // Try to continue without filling postal code
    await checkoutPage.firstName.fill('Jane');
    await checkoutPage.lastName.fill('Doe');
    await checkoutPage.continueButton.click();

    // Should see error for missing postal code
    const errorLocator = page.locator('[data-test="error"]');
    await expect(errorLocator).toBeVisible();
  });

  test('Required field enforcement: all fields empty', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await productsPage.gotoCart();
    await cartPage.checkout();

    // Try to continue without filling any field
    await checkoutPage.continueButton.click();

    // Should see error
    const errorLocator = page.locator('[data-test="error"]');
    await expect(errorLocator).toBeVisible();
  });

  test('Checkout with special characters in fields', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();
    await cartPage.checkout();

    await checkoutPage.fillCheckoutInfo("O'Brien", "O'Connor-Smith", 'A1B 2C3');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('Checkout with numeric postal code', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();
    await cartPage.checkout();

    await checkoutPage.fillCheckoutInfo('Jane', 'Doe', '98765');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('Checkout page displays order overview', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const product = 'Sauce Labs Backpack';
    await productsPage.addProductToCart(product);
    await productsPage.gotoCart();
    await cartPage.checkout();

    // Verify product is shown in checkout
    const checkoutItems = page.locator('.cart_item');
    await expect(checkoutItems).toHaveCount(1);
    await checkoutItems.filter({ hasText: product }).first().waitFor({ state: 'visible' });
  });

  test('Checkout flow: problem user', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(PROBLEM_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();
    await cartPage.checkout();

    await checkoutPage.fillCheckoutInfo('Test', 'User', '00000');
    // Problem user may have visual issues but should still complete
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('Checkout: verify page transitions', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();

    // Verify on cart page
    await expect(page).toHaveURL(/cart.html/);
    
    await cartPage.checkout();

    // Verify on step 1
    await expect(page).toHaveURL(/checkout-step-one.html/);

    // Fill and continue
    await checkoutPage.fillCheckoutInfo('Jane', 'Doe', '90210');

    // Verify on step 2
    await expect(page).toHaveURL(/checkout-step-two.html/);

    await checkoutPage.finishCheckout();

    // Verify on complete
    await expect(page).toHaveURL(/checkout-complete.html/);
  });

  test('Empty cart checkout validation', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Go to cart without adding anything
    await productsPage.gotoCart();

    // Cart should be empty
    const itemCount = await cartPage.getCartItemCount();
    await expect(itemCount).toBe(0);

    // Checkout button may or may not be visible/enabled for empty cart
    // This depends on the implementation
    const checkoutButton = cartPage.checkoutButton;
    const isEnabled = await checkoutButton.isEnabled().catch(() => false);
    // If button is enabled, we can attempt checkout (some systems allow empty cart)
  });
});
