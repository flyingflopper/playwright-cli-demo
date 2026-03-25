import { Page, Locator, expect } from '@playwright/test';

export class SauceHomePage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async navigate(url: string = 'https://www.saucedemo.com/') {
    await this.page.goto(url);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async assertLoginError(text: string) {
    await this.errorMessage.waitFor({ state: 'visible' });
    await expect(this.errorMessage).toContainText(text);
  }

  async logout() {
    const burgerMenu = this.page.getByRole('button', { name: 'Open Menu' });
    await burgerMenu.click();
    await this.page.getByRole('link', { name: 'Logout' }).click();
  }
}
