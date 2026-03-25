import { test as base } from '@playwright/test';
import { SauceHomePage } from '../pages/SauceHomePage';
import { SauceProductsPage } from '../pages/SauceProductsPage';
import { SauceCartPage } from '../pages/SauceCartPage';
import { SauceCheckoutPage } from '../pages/SauceCheckoutPage';

type SauceDemoFixtures = {
  homePage: SauceHomePage;
  productsPage: SauceProductsPage;
  cartPage: SauceCartPage;
  checkoutPage: SauceCheckoutPage;
};

export const test = base.extend<SauceDemoFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new SauceHomePage(page);
    await use(homePage);
  },

  productsPage: async ({ page }, use) => {
    const productsPage = new SauceProductsPage(page);
    await use(productsPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new SauceCartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new SauceCheckoutPage(page);
    await use(checkoutPage);
  },
});

export { expect } from '@playwright/test';
