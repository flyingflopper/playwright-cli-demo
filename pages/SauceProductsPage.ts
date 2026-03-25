import { Page, Locator } from '@playwright/test';

export class SauceProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly burgerMenu: Locator;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.burgerMenu = page.getByRole('button', { name: 'Open Menu' });
    this.sortDropdown = page.locator('[data-test="productSort"]');
    this.inventoryItems = page.locator('.inventory_item');
  }

  async addProductToCart(productName: string) {
    const productCard = this.page.locator('.inventory_item', { hasText: productName });
    await productCard.getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProductFromCart(productName: string) {
    const productCard = this.page.locator('.inventory_item', { hasText: productName });
    await productCard.getByRole('button', { name: 'Remove' }).click();
  }

  async gotoCart() {
    await this.page.locator('.shopping_cart_link').click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    const sortOptions: Record<string, string> = {
      'az': 'Name (A to Z)',
      'za': 'Name (Z to A)',
      'lohi': 'Price (low to high)',
      'hilo': 'Price (high to low)',
    };
    await this.sortDropdown.selectOption(option);
  }

  async getCartCount() {
    return await this.cartBadge.textContent();
  }

  async getProductPrices(): Promise<number[]> {
    const prices = await this.page.locator('.inventory_item_price').allTextContents();
    return prices.map(price => parseFloat(price.replace('$', '')));
  }

  async logout() {
    await this.burgerMenu.click();
    await this.page.getByRole('link', { name: 'Logout' }).click();
  }
}

