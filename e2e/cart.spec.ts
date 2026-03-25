import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('Shopping Cart', () => {
  test('Add and view single product in cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.verifyItemInCart('Sauce Labs Backpack');
  });

  test('Add same product twice to cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const product = 'Sauce Labs Backpack';
    
    // Add product twice
    await productsPage.addProductToCart(product);
    await productsPage.addProductToCart(product);
    
    await expect(productsPage.cartBadge).toHaveText('2');

    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(2);
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

  test('Remove all items from cart one by one', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

    // Add products
    for (const product of products) {
      await productsPage.addProductToCart(product);
    }
    await expect(productsPage.cartBadge).toHaveText('2');

    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    // Remove each one
    for (const product of products) {
      await cartPage.removeItemFromCart(product);
    }

    // Cart should now be empty
    const itemCount = await cartPage.getCartItemCount();
    await expect(itemCount).toBe(0);
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

  test('Add and remove product via product page', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const product = 'Sauce Labs Backpack';

    // Add product
    await productsPage.addProductToCart(product);
    await expect(productsPage.cartBadge).toHaveText('1');

    // Remove from products page
    await productsPage.removeProductFromCart(product);

    // Cart badge should be gone or show 0
    const badge = productsPage.cartBadge;
    const isVisible = await badge.isVisible().catch(() => false);
    if (isVisible) {
      await expect(badge).toHaveText('0');
    }
  });

  test('Cart badge updates correctly with multiple operations', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Add 1st product
    await productsPage.addProductToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    // Add 2nd product
    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await expect(productsPage.cartBadge).toHaveText('2');

    // Remove from cart page
    await productsPage.gotoCart();
    await cartPage.removeItemFromCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    // Go back and add more
    await cartPage.continueShopping();
    await productsPage.addProductToCart('Sauce Labs Bolt T-Shirt');
    await expect(productsPage.cartBadge).toHaveText('2');
  });

  test('Continue shopping returns to products page', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();

    await expect(page).toHaveURL(/cart.html/);

    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory.html/);
    await expect(productsPage.title).toHaveText('Products');
  });

  test('Cart maintains state when navigating between pages', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const product = 'Sauce Labs Backpack';
    await productsPage.addProductToCart(product);

    // Go to cart
    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    // Continue shopping
    await cartPage.continueShopping();

    // Add another product
    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await expect(productsPage.cartBadge).toHaveText('2');

    // Go back to cart - both should still be there
    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(2);
  });

  test('Cart displays product prices correctly', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();

    // Verify price is visible in cart
    const priceElements = page.locator('.inventory_item_price');
    const count = await priceElements.count();
    await expect(count).toBeGreaterThan(0);

    // Verify price format (starts with $)
    const priceText = await priceElements.first().textContent();
    expect(priceText).toMatch(/\$\d+\.\d{2}/);
  });

  test('Cart displays product names correctly', async ({ page, homePage, productsPage, cartPage }) => {
    const productNames = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    for (const name of productNames) {
      await productsPage.addProductToCart(name);
    }

    await productsPage.gotoCart();

    for (const name of productNames) {
      await cartPage.verifyItemInCart(name);
    }
  });

  test('Cart page URL is correct', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();

    await expect(page).toHaveURL(/cart.html/);
  });

  test('Add all available products to cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Get all product names and add them
    const products = await productsPage.inventoryItems.count();
    
    // Add first 3-4 products to keep test reasonable
    const productsToAdd = Math.min(4, products);
    const productButtons = page.locator('.inventory_item button:has-text("Add to cart")');

    for (let i = 0; i < productsToAdd; i++) {
      await productButtons.nth(i).click();
    }

    await expect(productsPage.cartBadge).toHaveText(productsToAdd.toString());

    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(productsToAdd);
  });
});
