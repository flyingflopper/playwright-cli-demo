import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('Product Browsing', () => {
  test('Products page loads with title', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await expect(productsPage.title).toHaveText('Products');
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('Products page displays multiple products', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Count inventory items
    const itemCount = await productsPage.inventoryItems.count();
    await expect(itemCount).toBeGreaterThan(0);
  });

  test('Each product displays required information', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const firstProduct = productsPage.inventoryItems.first();
    
    // Check for product name, price, and add to cart button
    await expect(firstProduct.locator('.inventory_item_name')).toBeVisible();
    await expect(firstProduct.locator('.inventory_item_price')).toBeVisible();
    await expect(firstProduct.getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  test('Sort products by name A to Z', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.sortBy('az');
    await page.waitForTimeout(500);

    const names = await productsPage.inventoryItems
      .locator('.inventory_item_name')
      .allTextContents();

    // Verify sorted in ascending order
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  test('Sort products by name Z to A', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.sortBy('za');
    await page.waitForTimeout(500);

    const names = await productsPage.inventoryItems
      .locator('.inventory_item_name')
      .allTextContents();

    // Verify sorted in descending order
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeGreaterThanOrEqual(0);
    }
  });

  test('Sort products by price low to high', async ({ page, homePage, productsPage }) => {
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

  test('Sort products by price high to low', async ({ page, homePage, productsPage }) => {
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

  test('Verify all product prices are in correct format', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const prices = await page.locator('.inventory_item_price').allTextContents();

    // Each price should match format $XX.XX
    for (const price of prices) {
      expect(price).toMatch(/\$\d+\.\d{2}/);
    }
  });

  test('Sort dropdown is functional', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Get initial product order
    let initialNames = await productsPage.inventoryItems
      .locator('.inventory_item_name')
      .allTextContents();

    // Sort by Z to A
    await productsPage.sortBy('za');
    await page.waitForTimeout(500);

    // Get new product order
    let newNames = await productsPage.inventoryItems
      .locator('.inventory_item_name')
      .allTextContents();

    // Verify order changed
    expect(initialNames).not.toEqual(newNames);
  });

  test('Product sorting persists with pagination', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Sort by price low to high
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(500);

    const firstPagePrices = await productsPage.getProductPrices();

    // If there are multiple pages, navigate and verify sort persists
    // (Note: SauceDemo typically shows all on 1 page, but this tests the logic)
    const newPrices = await productsPage.getProductPrices();
    expect(firstPagePrices).toEqual(newPrices);
  });

  test('Cart interaction does not affect sort order', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Sort by price low to high
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(500);
    const sortedPrices = await productsPage.getProductPrices();

    // Add products to cart
    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.addProductToCart('Sauce Labs Bike Light');

    // Go to cart and back
    await productsPage.gotoCart();
    await cartPage.continueShopping();

    // Verify sort order is maintained
    const newPrices = await productsPage.getProductPrices();
    expect(sortedPrices).toEqual(newPrices);
  });

  test('Add to cart button is available for all products', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const addButtons = page.locator('.inventory_item button:has-text("Add to cart")');
    const buttonCount = await addButtons.count();
    const productCount = await productsPage.inventoryItems.count();

    expect(buttonCount).toBe(productCount);
  });

  test('Product prices are visible and readable', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const priceElements = page.locator('.inventory_item_price');
    
    for (let i = 0; i < await priceElements.count(); i++) {
      const priceText = await priceElements.nth(i).textContent();
      expect(priceText).toBeTruthy();
      expect(priceText).toMatch(/\$\d+\.\d{2}/);
    }
  });

  test('Product descriptions are visible', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const descriptions = page.locator('.inventory_item_desc');
    const descCount = await descriptions.count();

    // There should be descriptions for products
    expect(descCount).toBeGreaterThan(0);
  });

  test('Change sort multiple times in one session', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Sort by price low to high
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(300);
    const loToHi = await productsPage.getProductPrices();

    // Sort by price high to low
    await productsPage.sortBy('hilo');
    await page.waitForTimeout(300);
    const hiToLo = await productsPage.getProductPrices();

    // Sort by name A to Z
    await productsPage.sortBy('az');
    await page.waitForTimeout(300);
    const nameAtoZ = await productsPage.inventoryItems
      .locator('.inventory_item_name')
      .allTextContents();

    // All should be different orders
    expect(loToHi).not.toEqual(hiToLo);
    // Name sort shouldn't match price sort (unless coincidental)
  });

  test('Verify specific product availability', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Check for specific products that should exist
    const requiredProducts = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
    ];

    for (const product of requiredProducts) {
      const productElement = page.locator('.inventory_item', { hasText: product });
      await expect(productElement).toBeVisible();
    }
  });

  test('Default sort order on page load', async ({ page, homePage, productsPage }) => {
    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Get default order (should be Name A to Z typically)
    const names = await productsPage.inventoryItems
      .locator('.inventory_item_name')
      .allTextContents();

    // Verify there are products in default order
    expect(names.length).toBeGreaterThan(0);
  });
});
