# Playwright CLI Demo - Comprehensive Test Suite

[![Playwright Tests](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/tests.yml/badge.svg)](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/tests.yml)
[![Code Quality](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/quality.yml/badge.svg)](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/quality.yml)

A comprehensive test automation suite for the SauceDemo e-commerce application using Playwright. This project includes both UI/E2E tests and API tests with mocking capabilities.

## 📋 Project Overview

This testing framework provides extensive coverage for:
- **Authentication workflows** (login, logout, session management)
- **Product browsing** (filtering, sorting, searching)
- **Shopping cart operations** (add, remove, updates)
- **Checkout process** (validation, payment processing)
- **API endpoints** (with request mocking)
- **Integration scenarios** (complex user workflows)

## 🏗️ Project Structure

```
playwright-cli-demo/
├── .github/
│   └── workflows/                   # GitHub Actions CI/CD
│       ├── tests.yml               # Main test execution pipeline
│       ├── manual-test.yml         # Manual test trigger
│       └── quality.yml             # Code quality checks
├── e2e/                          # End-to-end UI tests
│   ├── auth.spec.ts             # Authentication tests (13 tests)
│   ├── products.spec.ts         # Product browsing tests (21 tests)
│   ├── cart.spec.ts             # Shopping cart tests (14 tests)
│   ├── checkout.spec.ts         # Checkout flow tests (12 tests)
│   ├── integration.spec.ts      # Complex workflows (10 tests)
│   ├── saucedemo.spec.ts        # Original test suite
│   └── example.spec.ts          # Example Playwright tests
├── api/                          # API tests with mocking
│   ├── auth.spec.ts             # Authentication endpoints (7 tests)
│   ├── products.spec.ts         # Product endpoints (10 tests)
│   ├── cart.spec.ts             # Cart endpoints (10 tests)
│   └── checkout.spec.ts         # Checkout endpoints (10 tests)
├── pages/                        # Page Object Models
│   ├── SauceHomePage.ts         # Login page
│   ├── SauceProductsPage.ts     # Products listing
│   ├── SauceCartPage.ts         # Shopping cart
│   └── SauceCheckoutPage.ts     # Checkout pages
├── fixtures/                     # Test fixtures
│   └── saucedemoFixtures.ts     # Shared fixtures & page objects
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── README.md                      # This file

```

## 📊 Test Coverage

### E2E Tests (70 tests)
- **Authentication** (13 tests): Login validation, logout, session persistence, user types, security
- **Products** (21 tests): Display, sorting, filtering, pricing, availability verification
- **Cart** (14 tests): Add/remove items, quantity updates, persistence, edge cases
- **Checkout** (12 tests): Form validation, page transitions, order processing
- **Integration** (10 tests): End-to-end workflows, multi-step scenarios

### API Tests (37 tests)
- **Authentication** (7 tests): Login/logout endpoints, session validation, rate limiting, token refresh
- **Products** (10 tests): Fetch, search, sort, pricing, availability, pagination
- **Cart** (10 tests): CRUD operations, persistence, quantity limits, state management
- **Checkout** (10 tests): Order initiation, validation, payment processing, status tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd playwright-cli-demo

# Install dependencies
npm install
```

### Configuration

The project is configured in `playwright.config.ts` to run tests from both `/e2e` and `/api` directories:

```typescript
testDir: '.',
testMatch: '**/(e2e|api)/**/*.spec.ts',
```

## 🧪 Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run E2E Tests Only
```bash
npx playwright test e2e/
```

### Run API Tests Only
```bash
npx playwright test api/
```

### Run Specific Test File
```bash
npx playwright test e2e/auth.spec.ts
npx playwright test api/products.spec.ts
```

### Run Specific Test
```bash
npx playwright test -g "Login positive"
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in headed mode (See browser)
```bash
npx playwright test --headed
```

### Debug Tests
```bash
npx playwright test --debug
```

## � CI/CD Pipeline

This project includes automated testing via GitHub Actions. Three workflows are configured:

### 1. **Playwright Tests** (`tests.yml`)
Runs on: Push to main/master, Pull requests, Daily schedule (2 AM UTC)

**Features:**
- Tests run on multiple Node.js versions (18.x, 20.x)
- Tests run on multiple browsers (Chromium, Firefox, WebKit)
- Dependency caching for faster runs
- HTML report generation and artifact upload
- Test results summary comment on PRs
- Continues on errors to collect all results

**Trigger Manual Run:**
```bash
gh workflow run tests.yml
```

### 2. **Manual Test Run** (`manual-test.yml`)
Trigger manually from the Actions tab with options:
- **Test Type**: All, E2E only, or API only
- **Browser**: Chromium, Firefox, WebKit, or All
- **Headless Mode**: Toggle on/off

**Use Case:** Run specific test combinations on-demand

### 3. **Code Quality** (`quality.yml`)
Runs on: Push to main/master, Pull requests

**Checks:**
- TypeScript compilation
- Test file validation
- Page Object file validation
- Playwright version verification
- Browser installation status
- Configuration file validation

### Accessing CI/CD Results

**View Workflow Status:**
```
https://github.com/flyingflopper/playwright-cli-demo/actions
```

**Download Test Reports:**
1. Go to Actions → Select workflow run
2. Scroll to "Artifacts" section
3. Download `playwright-report-*` artifacts

**View HTML Report:**
1. Download artifact from CI/CD
2. Extract the zip
3. Open `playwright-report/index.html` in browser

### Setting Up CI/CD (First Time)

The workflow files are already configured in `.github/workflows/`:

1. Push to GitHub:
```bash
git add .github/
git commit -m "Add GitHub Actions CI/CD"
git push origin master
```

2. GitHub Actions will automatically create the workflows

3. Grant necessary permissions:
   - Settings → Actions → Workflow permissions → Select "Read and write permissions"

### CI/CD Environment Variables

To add secrets for API testing:

1. Go to Settings → Secrets and Variables → Actions
2. Click "New repository secret"
3. Examples:
   - `API_BASE_URL`: Base URL for API tests
   - `TEST_TIMEOUT`: Custom timeout for tests

Access in workflows:
```yaml
env:
  API_BASE_URL: ${{ secrets.API_BASE_URL }}
```

### Monitoring & Alerts

**Email Notifications:**
- GitHub sends emails on workflow failures (default)
- Customize in Settings → Notifications

**PR Comments:**
- Workflows automatically comment on PRs with test summaries
- Shows pass/fail status per configuration

**Badges:**
Add to your README:
```markdown
[![Playwright Tests](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/tests.yml/badge.svg)](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/tests.yml)
[![Code Quality](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/quality.yml/badge.svg)](https://github.com/flyingflopper/playwright-cli-demo/actions/workflows/quality.yml)
```

## �📈 Test Results & Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports are generated in the `playwright-report/` directory.

## 🔧 Page Object Models

The project uses Page Object Model (POM) pattern for maintainability:

### SauceHomePage
```typescript
- navigate(url)
- login(username, password)
- assertLoginError(text)
- logout()
```

### SauceProductsPage
```typescript
- addProductToCart(productName)
- removeProductFromCart(productName)
- sortBy(option: 'az' | 'za' | 'lohi' | 'hilo')
- getProductPrices()
- getCartCount()
- gotoCart()
- logout()
```

### SauceCartPage
```typescript
- verifyItemInCart(productName)
- removeItemFromCart(productName)
- getCartItemCount()
- checkout()
- continueShopping()
```

### SauceCheckoutPage
```typescript
- fillCheckoutInfo(firstName, lastName, postalCode)
- finishCheckout()
```

## 🎭 API Mocking

API tests use Playwright's `page.route()` for request interception and mocking:

### Example: Mocking a Login Endpoint
```typescript
await page.route('**/api/auth/login', async (route) => {
  if (route.request().method() === 'POST') {
    const body = route.request().postDataJSON();
    
    if (body.username === 'standard_user') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'valid_token',
          user: { id: 1, name: 'Standard User' }
        })
      });
    } else {
      await route.fulfill({ status: 401 });
    }
  }
});
```

## 🧩 Test Fixtures

Custom fixtures are defined in `fixtures/saucedemoFixtures.ts`:

```typescript
import { test as base } from '@playwright/test';
import { SauceHomePage } from '../pages/SauceHomePage';
import { SauceProductsPage } from '../pages/SauceProductsPage';
import { SauceCartPage } from '../pages/SauceCartPage';
import { SauceCheckoutPage } from '../pages/SauceCheckoutPage';

export const test = base.extend({
  homePage: async ({ page }, use) => {
    await use(new SauceHomePage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new SauceProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new SauceCartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new SauceCheckoutPage(page));
  },
});

export { expect };
```

## 👥 User Accounts (Test Data)

The SauceDemo application provides multiple test users:

| Username | Password | Behavior |
|----------|----------|----------|
| standard_user | secret_sauce | Standard user |
| locked_out_user | secret_sauce | Account locked |
| problem_user | secret_sauce | Visual/logical issues |
| performance_glitch_user | secret_sauce | Performance issues |

## 🐛 Test Categories

### Authentication Tests
- Valid/invalid login credentials
- Empty field validation
- Session persistence
- Multiple user handling
- Logout functionality

### Product Tests
- Product listing and filtering
- Sorting (A-Z, Z-A, price low-high, high-low)
- Price verification
- Availability checking
- Pagination

### Cart Tests
- Add/remove items
- Quantity management
- Cart persistence
- Empty cart handling
- Multi-product workflows

### Checkout Tests
- Form validation (required fields)
- Page transitions (step 1 → step 2 → confirmation)
- Order processing
- Error handling
- Special characters support

### Integration Tests
- Complete shopping journeys
- Multi-step workflows
- State management across pages
- Session persistence
- Multiple user scenarios

## 📝 Example Test

```typescript
test('End-to-end: Browse → Sort → Add → Checkout → Complete', async ({ page, homePage, productsPage, cartPage, checkoutPage }) => {
  // Navigate and login
  await homePage.navigate(BASE_URL);
  await homePage.login('standard_user', 'secret_sauce');

  // Browse products
  await expect(productsPage.title).toHaveText('Products');

  // Sort products by price
  await productsPage.sortBy('lohi');
  await page.waitForTimeout(300);

  // Add first product
  await productsPage.addProductToCart('Sauce Labs Backpack');

  // Proceed to checkout
  await productsPage.gotoCart();
  await cartPage.checkout();

  // Complete checkout
  await checkoutPage.fillCheckoutInfo('John', 'Doe', '12345');
  await checkoutPage.finishCheckout();

  // Verify completion
  await expect(checkoutPage.completeMessage).toBeVisible();
});
```

## 🔌 Configuration Options

### Parallel Execution
Tests run in parallel by default. Disable with:
```bash
npx playwright test --workers=1
```

### Timeouts
Configure in `playwright.config.ts`:
```typescript
timeout: 30000,          // 30 seconds per test
navigationTimeout: 30000, // 30 seconds for navigation
```

### Retries (CI only)
```typescript
retries: process.env.CI ? 2 : 0,
```

### Base URL
Set in config or use explicitly:
```typescript
await page.goto('https://www.saucedemo.com/');
```

## 📚 Dependencies

- **@playwright/test**: ^1.58.2 - Testing framework
- **@types/node**: ^25.5.0 - TypeScript node types

## 🌍 Browser Compatibility

Tests run on:
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit

Configure in `playwright.config.ts`:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

## 🚨 CI/CD Integration

The configuration includes CI/CD features:
- Automatic retries on CI
- Single worker on CI for stability
- HTML reporting
- Trace collection on failures

## 📖 Best Practices

1. **Use Page Objects**: Encapsulate selectors and interactions
2. **Meaningful Assertions**: Test user-visible behaviors
3. **Data Isolation**: Each test is independent
4. **Descriptive Names**: Clear test intent
5. **Avoid Hardcodes**: Use configuration for URLs, test data
6. **Mock APIs**: Test UI and API separately
7. **Wait Strategically**: Use Playwright's auto-waiting
8. **Handle Errors**: Graceful error handling in tests

## 🤝 Contributing

1. Follow the Page Object Model pattern
2. Add descriptive test names
3. Use existing fixtures
4. Document complex scenarios
5. Update this README with new features

## 📞 Support

For issues or questions:
1. Check test reports: `npx playwright show-report`
2. Run in debug mode: `npx playwright test --debug`
3. Check Playwright docs: https://playwright.dev

## 📜 License

This project is licensed under the ISC License.

---

**Last Updated**: March 2026  
**Test Count**: 107 total tests (70 E2E + 37 API)  
**Framework**: Playwright Test  
**CI/CD**: GitHub Actions (3 workflows)
