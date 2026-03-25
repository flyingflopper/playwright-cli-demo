import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PROBLEM_USER = 'problem_user';
const PASSWORD = 'secret_sauce';

test.describe('Integration: Complex User Workflows', () => {
  test('End-to-end: Browse → Sort → Add → Checkout → Complete', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    // Navigate and login
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Browse products
    await expect(productsPage.title).toHaveText('Products');

    // Sort products
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(300);

    // Add lowest price item
    const prices = await productsPage.getProductPrices();
    expect(prices[0]).toBeLessThanOrEqual(prices[1]);

    // Add first product (lowest price)
    const firstProduct = await productsPage.inventoryItems.first();
    const productName = await firstProduct.locator('.inventory_item_name').textContent();
    
    await productsPage.addProductToCart(productName || 'Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    // Proceed to checkout
    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.checkout();

    // Complete checkout
    await checkoutPage.fillCheckoutInfo('John', 'Doe', '12345');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('Workflow: Add multiple products across different price points', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Add cheapest product
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(300);
    const prices = await productsPage.getProductPrices();
    const cheapestPrice = prices[0];

    // Get first product and add it
    const firstProduct = productsPage.inventoryItems.first();
    const firstName = await firstProduct.locator('.inventory_item_name').textContent() || '';
    await firstProduct.getByRole('button', { name: 'Add to cart' }).click();

    // Sort by most expensive and add top item
    await productsPage.sortBy('hilo');
    await page.waitForTimeout(300);
    const expensiveProduct = productsPage.inventoryItems.first();
    const expensiveName = await expensiveProduct.locator('.inventory_item_name').textContent() || '';
    await expensiveProduct.getByRole('button', { name: 'Add to cart' }).click();

    // Verify 2 items in cart
    await expect(productsPage.cartBadge).toHaveText('2');

    // View cart and checkout
    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    await cartPage.checkout();
    await checkoutPage.fillCheckoutInfo('Jane', 'Smith', '54321');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('Workflow: Browse all products, add selective items, review cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Get all products
    const itemCount = await productsPage.inventoryItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Add every other product (1, 3, 5...)
    const addButtons = page.locator('.inventory_item button:has-text("Add to cart")');
    for (let i = 0; i < itemCount; i += 2) {
      await addButtons.nth(i).click();
      await page.waitForTimeout(100);
    }

    const expectedCount = Math.ceil(itemCount / 2);
    await expect(productsPage.cartBadge).toHaveText(expectedCount.toString());

    // Go to cart and verify all added items
    await productsPage.gotoCart();
    const cartItems = await cartPage.cartItems.count();
    await expect(cartItems).toBe(expectedCount);
  });

  test('Workflow: Add → Remove → Add Again the same product', async ({ page, homePage, productsPage, cartPage }) => {
    const product = 'Sauce Labs Backpack';

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Add product
    await productsPage.addProductToCart(product);
    await expect(productsPage.cartBadge).toHaveText('1');

    // Go to cart and remove
    await productsPage.gotoCart();
    await cartPage.removeItemFromCart(product);
    const cartCount = await cartPage.getCartItemCount();
    await expect(cartCount).toBe(0);

    // Go back and add again
    await cartPage.continueShopping();
    await productsPage.addProductToCart(product);
    await expect(productsPage.cartBadge).toHaveText('1');

    // Go to cart and verify it's there
    await productsPage.gotoCart();
    await cartPage.verifyItemInCart(product);
  });

  test('Workflow: Sort changes, add item, sort again, verify item still in cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Sort by price low to high
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(300);

    // Add a product
    const firstProduct = productsPage.inventoryItems.first();
    const productName = await firstProduct.locator('.inventory_item_name').textContent() || '';
    await firstProduct.getByRole('button', { name: 'Add to cart' }).click();

    // Sort differently  
    await productsPage.sortBy('az');
    await page.waitForTimeout(300);

    // Add a different product
    const differentProduct = productsPage.inventoryItems.nth(2);
    const diffName = await differentProduct.locator('.inventory_item_name').textContent() || '';
    
    if (diffName !== productName) {
      await differentProduct.getByRole('button', { name: 'Add to cart' }).click();
    }

    // Get cart count
    const badge = await productsPage.cartBadge.textContent();
    await expect(parseInt(badge || '0')).toBeGreaterThanOrEqual(1);

    // Go to cart
    await productsPage.gotoCart();
    const cartItems = await cartPage.getCartItemCount();
    await expect(cartItems).toBeGreaterThanOrEqual(1);
  });

  test('Workflow: Session timeout scenario - logout/login preserves cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Add items
    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await expect(productsPage.cartBadge).toHaveText('2');

    // Logout
    await productsPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Login again with same user
    await homePage.login(STANDARD_USER, PASSWORD);

    // Cart should still have items
    await expect(productsPage.cartBadge).toHaveText('2');

    // Verify by going to cart
    await productsPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(2);
  });

  test('Workflow: Multiple users different carts', async ({ page, homePage, productsPage, cartPage }) => {
    // User 1: Standard user
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    // Logout
    await productsPage.logout();

    // User 2: Problem user
    await homePage.login(PROBLEM_USER, PASSWORD);

    // Should have empty cart
    const badge = productsPage.cartBadge;
    const isVisible = await badge.isVisible().catch(() => false);
    if (isVisible) {
      const count = await badge.textContent();
      expect(count).not.toBe('1');
    }

    // Add different item
    await productsPage.addProductToCart('Sauce Labs Bike Light');

    // Logout and login as first user
    await productsPage.logout();
    await homePage.login(STANDARD_USER, PASSWORD);

    // Should have original item, not problem user's item
    await expect(productsPage.cartBadge).toHaveText('1');
    await productsPage.gotoCart();
    await cartPage.verifyItemInCart('Sauce Labs Backpack');
  });

  test('Workflow: Full shopping experience with multiple operations', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Step 1: Browse and sort
    await expect(productsPage.title).toHaveText('Products');
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(300);

    // Step 2: Add multiple items
    const items = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
    for (const item of items) {
      try {
        await productsPage.addProductToCart(item);
        await page.waitForTimeout(100);
      } catch {
        // Item might not exist, continue
      }
    }

    // Step 3: Review cart
    const badgeCount = await productsPage.cartBadge.textContent();
    const itemsAdded = parseInt(badgeCount || '0');
    expect(itemsAdded).toBeGreaterThan(0);

    await productsPage.gotoCart();
    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(itemsAdded);

    // Step 4: Modify cart - remove one item
    if (cartItemCount > 1) {
      const firstItem = await cartPage.cartItems.first().locator('.inventory_item_name').textContent() || '';
      await cartPage.removeItemFromCart(firstItem);
    }

    // Step 5: Continue to checkout
    await cartPage.checkout();

    // Step 6: Complete checkout
    await checkoutPage.fillCheckoutInfo('Integration', 'Test', '99999');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
    await expect(page).toHaveURL(/checkout-complete.html/);
  });

  test('Workflow: Price verification across product sorting', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Get prices in default order
    const defaultPrices = await productsPage.getProductPrices();

    // Sort by price low to high
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(300);
    const lowToHighPrices = await productsPage.getProductPrices();

    // Verify low to high is actually sorted
    for (let i = 0; i < lowToHighPrices.length - 1; i++) {
      expect(lowToHighPrices[i]).toBeLessThanOrEqual(lowToHighPrices[i + 1]);
    }

    // Sort by price high to low
    await productsPage.sortBy('hilo');
    await page.waitForTimeout(300);
    const highToLowPrices = await productsPage.getProductPrices();

    // Verify high to low is actually sorted
    for (let i = 0; i < highToLowPrices.length - 1; i++) {
      expect(highToLowPrices[i]).toBeGreaterThanOrEqual(highToLowPrices[i + 1]);
    }

    // Verify low to high is reverse of high to low
    const reversed = highToLowPrices.slice().reverse();
    expect(lowToHighPrices).toEqual(reversed);
  });

  test('Workflow: Checkout validation with incomplete info then completion', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();
    await cartPage.checkout();

    // Try to continue with incomplete info
    await checkoutPage.firstName.fill('John');
    await checkoutPage.continueButton.click();

    // Should have error
    const errorLocator = page.locator('[data-test="error"]');
    const isVisible = await errorLocator.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();

    // Now complete the form
    await checkoutPage.lastName.fill('Doe');
    await checkoutPage.postalCode.fill('12345');
    await checkoutPage.continueButton.click();

    // Should proceed to step 2
    await expect(page).toHaveURL(/checkout-step-two.html/);

    // Complete checkout
    await checkoutPage.finishCheckout();
    await expect(checkoutPage.completeMessage).toBeVisible();
  });
});
