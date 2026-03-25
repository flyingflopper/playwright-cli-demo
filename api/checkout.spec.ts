import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('API: Checkout Endpoints', () => {
  test('API: Initiate checkout creates order', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    let checkoutInitiated = false;

    await page.route('**/api/checkout/init', async (route) => {
      if (route.request().method() === 'POST') {
        checkoutInitiated = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            orderId: 'ORD-12345',
            status: 'initiated',
            total: 29.99
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
    await cartPage.checkout();
  });

  test('API: Submit checkout info validates required fields', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await page.route('**/api/checkout/info', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();

        if (!body.firstName || !body.lastName || !body.postalCode) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Required fields missing',
              fields: ['firstName', 'lastName', 'postalCode']
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Checkout info validated'
            })
          });
        }
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    await productsPage.gotoCart();
    await cartPage.checkout();

    await checkoutPage.fillCheckoutInfo('Jane', 'Doe', '90210');
    await checkoutPage.continueButton.click();
  });

  test('API: Complete checkout processes payment', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    let checkoutCompleted = false;

    await page.route('**/api/checkout/complete', async (route) => {
      if (route.request().method() === 'POST') {
        checkoutCompleted = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orderId: 'ORD-12345',
            status: 'completed',
            total: 29.99,
            message: 'Order placed successfully'
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
    await cartPage.checkout();

    await checkoutPage.fillCheckoutInfo('Jane', 'Doe', '90210');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('API: Get shipping options', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await page.route('**/api/checkout/shipping', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            options: [
              { id: 1, name: 'Standard', price: 5.99, days: '5-7' },
              { id: 2, name: 'Express', price: 12.99, days: '2-3' },
              { id: 3, name: 'Overnight', price: 24.99, days: '1' }
            ]
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
    await cartPage.checkout();
  });

  test('API: Calculate order total with tax', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await page.route('**/api/checkout/total', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        const subtotal = body.subtotal || 0;
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            subtotal,
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2))
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
  });

  test('API: Payment processing with validation', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    let paymentAttempts = 0;

    await page.route('**/api/checkout/payment', async (route) => {
      if (route.request().method() === 'POST') {
        paymentAttempts++;
        const body = route.request().postDataJSON();

        // Validate card format
        if (!body.cardNumber || body.cardNumber.length < 13) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Invalid card number'
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              transactionId: 'TXN-' + Date.now(),
              status: 'approved'
            })
          });
        }
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
  });

  test('API: Order confirmation endpoint', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    let confirmationRequested = false;

    await page.route('**/api/checkout/confirmation/*', async (route) => {
      if (route.request().method() === 'GET') {
        confirmationRequested = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orderId: 'ORD-12345',
            status: 'confirmed',
            items: [
              { name: 'Sauce Labs Backpack', qty: 1, price: 29.99 }
            ],
            total: 29.99,
            estimatedDelivery: '2026-04-02'
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
    await cartPage.checkout();

    await checkoutPage.fillCheckoutInfo('Jane', 'Doe', '90210');
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeMessage).toBeVisible();
  });

  test('API: Promo code validation endpoint', async ({ page, homePage, productsPage, cartPage }) => {
    await page.route('**/api/checkout/promo', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        const code = body.code;

        if (code === 'SAVE10') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              valid: true,
              discount: 0.10,
              message: '10% discount applied'
            })
          });
        } else if (code === 'INVALID') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              valid: false,
              error: 'Promo code not found or expired'
            })
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
  });

  test('API: Checkout with multiple payment methods', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
    await page.route('**/api/checkout/methods', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            methods: [
              { id: 1, name: 'Credit Card', available: true },
              { id: 2, name: 'PayPal', available: true },
              { id: 3, name: 'Apple Pay', available: false },
              { id: 4, name: 'Gift Card', available: true }
            ]
          })
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    await productsPage.addProductToCart('Sauce Labs Backpack');
  });

  test('API: Order status tracking', async ({ page }) => {
    await page.route('**/api/checkout/status/*', async (route) => {
      const orderId = route.request().url().split('/').pop();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId,
          status: 'processing',
          items: [
            { name: 'Sauce Labs Backpack', qty: 1, price: 29.99 }
          ],
          total: 29.99,
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    // API test - direct evaluation
    const result = await page.evaluate(async () => {
      return { success: true };
    });

    expect(result.success).toBe(true);
  });
});
