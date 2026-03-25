const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.saucedemo.com/');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  const h = await page.locator('.title').textContent();
  console.log('heading:', h);
  const err = await page.locator('.checkout_info .error-message-container, .error-message-container').allTextContents();
  console.log('error:', err);
  await browser.close();
})();