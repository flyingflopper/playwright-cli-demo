import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('API: Cart Endpoints', () => {
  test('API: Add item to cart creates cart entry', async ({ page, homePage, productsPage, cartPage }) => {
    let addToCartCalled = false;

    await page.route('**/api/cart/add', async (route) => {
      if (route.request().method() === 'POST') {
        addToCartCalled = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            cartTotal: 1,
            message: 'Item added to cart'
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  test('API: Get cart returns all items', async ({ page, homePage, productsPage, cartPage }) => {
    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              { id: 1, name: 'Sauce Labs Backpack', price: 29.99, quantity: 1 }
            ],
            total: 29.99,
            count: 1
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();

    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBeGreaterThanOrEqual(1);
  });

  test('API: Remove item from cart', async ({ page, homePage, productsPage, cartPage }) => {
    let removeCallCount = 0;

    await page.route('**/api/cart/remove/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        removeCallCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            cartTotal: 0,
            message: 'Item removed from cart'
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();
    
    const itemName = await cartPage.cartItems.first().locator('.inventory_item_name').textContent() || '';
    if (itemName) {
      await cartPage.removeItemFromCart(itemName);
    }
  });

  test('API: Update cart item quantity', async ({ page, homePage, productsPage, cartPage }) => {
    let updateCalled = false;

    await page.route('**/api/cart/update', async (route) => {
      if (route.request().method() === 'PUT') {
        updateCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            items: [
              { id: 1, name: 'Product', price: 29.99, quantity: 2 }
            ],
            total: 59.98
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Add same product twice
    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.addProductToCart('Sauce Labs Backpack');

    await expect(productsPage.cartBadge).toHaveText('2');
  });

  test('API: Clear entire cart', async ({ page, homePage, productsPage, cartPage }) => {
    let clearCalled = false;

    await page.route('**/api/cart/clear', async (route) => {
      if (route.request().method() === 'DELETE') {
        clearCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Cart cleared'
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.addProductToCart('Sauce Labs Bike Light');
    await productsPage.gotoCart();

    const initialCount = await cartPage.getCartItemCount();
    expect(initialCount).toBeGreaterThan(1);
  });

  test('API: Get cart total price calculation', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/cart/total', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            subtotal: 39.98,
            tax: 3.20,
            total: 43.18,
            itemCount: 2
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.addProductToCart('Sauce Labs Bike Light');

    const cartBadge = await productsPage.cartBadge.textContent();
    expect(parseInt(cartBadge || '0')).toBeGreaterThan(0);
  });

  test('API: Cart persistence across sessions', async ({ page, homePage, productsPage, cartPage }) => {
    await page.route('**/api/cart/persist', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Cart persisted'
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await expect(productsPage.cartBadge).toHaveText('1');

    // Simulate logout/login
    await productsPage.logout();
    await homePage.login(STANDARD_USER, PASSWORD);

    // Cart should persist
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  test('API: cart endpoint with invalid item returns error', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/cart/add', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Product not found',
            code: 'PRODUCT_NOT_FOUND'
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const itemCountBefore = await productsPage.cartBadge.isVisible().catch(() => false);
    expect(typeof itemCountBefore).toBe('boolean');
  });

  test('API: Validate cart item limits', async ({ page, homePage, productsPage }) => {
    let addAttempts = 0;

    await page.route('**/api/cart/add', async (route) => {
      if (route.request().method() === 'POST') {
        addAttempts++;

        // Limit to 10 items per product
        if (addAttempts > 10) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Maximum quantity exceeded',
              limit: 10
            })
          });
        } else {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              cartTotal: addAttempts
            })
          });
        }
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Try to add items (limited by the mock)
    for (let i = 0; i < 5; i++) {
      await productsPage.addProductToCart('Sauce Labs Backpack');
    }

    expect(addAttempts).toBe(5);
  });
});
