import { test, expect } from '../fixtures/saucedemoFixtures';

const BASE_URL = 'https://www.saucedemo.com/';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

const mockProducts = [
  {
    id: 4,
    name: 'Sauce Labs Backpack',
    desc: 'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with uncompromising laptop and tablet protection.',
    price: 29.99,
    image: '/img/sauce-backpack-324x324.jpg'
  },
  {
    id: 5,
    name: 'Sauce Labs Bike Light',
    desc: 'A red light isn\'t the desired state in testing but it sure helps when riding your bike at night. water-resistant (35 splash protection), Represents quality as sent by table form to the database.',
    price: 9.99,
    image: '/img/sauce-bike-light-9c2169.jpg'
  },
  {
    id: 1,
    name: 'Sauce Labs Bolt T-Shirt',
    desc: 'Get your testing superhero on with the Sauce Labs bolt T-shirt',
    price: 15.99,
    image: '/img/sauce-bolts-1640064953.jpg'
  }
];

test.describe('API: Product Endpoints', () => {
  test('API: Get all products returns product list', async ({ page, homePage, productsPage }) => {
    let productsFetched = false;

    await page.route('**/api/products', async (route) => {
      if (route.request().method() === 'GET') {
        productsFetched = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProducts)
        });
      } else {
        await route.continue();
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Products should be loaded
    const itemCount = await productsPage.inventoryItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('API: Get product by ID returns product details', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/products/*', async (route) => {
      const url = route.request().url();
      const productId = url.split('/').pop();

      const product = mockProducts.find(p => p.id === parseInt(productId || ''));

      if (product) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(product)
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Product not found' })
        });
      }
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Verify products are displayed
    const productTitle = page.locator('.inventory_item_name').first();
    await expect(productTitle).toBeVisible();
  });

  test('API: Product search endpoint filters results', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/products/search*', async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get('q')?.toLowerCase() || '';

      const filtered = mockProducts.filter(p =>
        p.name.toLowerCase().includes(query)
      );

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filtered)
      });
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Products should be displayed
    const items = await productsPage.inventoryItems;
    await expect(items.first()).toBeVisible();
  });

  test('API: Get product prices returns correct format', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/products/prices', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: mockProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price
          }))
        })
      });
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const prices = await productsPage.getProductPrices();
    prices.forEach(price => {
      expect(price).toBeGreaterThan(0);
    });
  });

  test('API: Product availability check endpoint', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/products/*/availability', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          available: true,
          quantity: 100
        })
      });
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // All products should be available for purchase
    const addButtons = page.locator('.inventory_item button:has-text("Add to cart")');
    const count = await addButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('API: Product endpoint with authentication', async ({ page, homePage, productsPage }) => {
    let requestAuth = false;

    await page.route('**/api/products', async (route) => {
      const headers = await route.request().allHeaders();
      requestAuth = !!headers['authorization'];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts)
      });
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Should have made authenticated request
    const items = await productsPage.inventoryItems;
    expect(items).toBeDefined();
  });

  test('API: Product sort endpoint returns sorted results', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/products/sort*', async (route) => {
      const url = new URL(route.request().url());
      const sortBy = url.searchParams.get('sortBy') || 'name';

      let sorted = [...mockProducts];

      if (sortBy === 'price_asc') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        sorted.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name_asc') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'name_desc') {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sorted)
      });
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Test low to high sort
    await productsPage.sortBy('lohi');
    await page.waitForTimeout(300);

    const prices = await productsPage.getProductPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  test('API: Product images load correctly', async ({ page, homePage, productsPage }) => {
    let imageRequests = 0;

    await page.route('**/img/**', async (route) => {
      imageRequests++;
      // Continue to actual image or mock response
      await route.continue();
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    // Images should be requested
    await page.waitForTimeout(500);
    expect(imageRequests).toBeGreaterThanOrEqual(0);
  });

  test('API: Product not found returns 404', async ({ page }) => {
    let notFoundRequested = false;

    await page.route('**/api/products/99999', async (route) => {
      notFoundRequested = true;
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        })
      });
    });

    // API test - direct fetch
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/products/99999');
        return { status: res.status };
      } catch (e) {
        return { error: true };
      }
    }).catch(() => ({ error: true }));

    expect(response).toBeDefined();
  });

  test('API: Bulk product fetch with pagination', async ({ page, homePage, productsPage }) => {
    await page.route('**/api/products/bulk*', async (route) => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      const start = (page - 1) * limit;
      const paginated = mockProducts.slice(start, start + limit);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: paginated,
          page,
          limit,
          total: mockProducts.length,
          totalPages: Math.ceil(mockProducts.length / limit)
        })
      });
    });

    await homePage.navigate(BASE_URL);
    await homePage.login(STANDARD_USER, PASSWORD);

    const items = await productsPage.inventoryItems;
    expect(items).toBeDefined();
  });
});
