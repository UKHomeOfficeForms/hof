'use strict';

const { chromium } = require('playwright');
const autofill = require('../../../utilities/autofill');

// Migration compatibility adapter for the subset of the WebdriverIO API used by
// the functional tests and autofill utility. This lets the existing tests run on
// Playwright without rewriting every test at once.
//
// Longer term, these tests should move toward Playwright's native API,
// especially page.locator(), to use Playwright's auto-waiting and assertions.

async function waitForPage(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
}

class Element {
  constructor(page, handle) {
    this.page = page;
    this.handle = handle;
  }

  async $(selector) {
    return new Element(this.page, this.handle && await this.handle.$(selector));
  }

  async $$(selector) {
    const handles = this.handle ? await this.handle.$$(selector) : [];
    return handles.map(handle => new Element(this.page, handle));
  }

  async clearValue() {
    await this.handle.fill('');
  }

  async click() {
    await this.handle.click();
    await waitForPage(this.page);
  }

  async getAttribute(attribute) {
    return this.handle.getAttribute(attribute);
  }

  async getText() {
    return this.handle.textContent();
  }

  async getValue() {
    return this.handle.inputValue();
  }

  async isExisting() {
    return Boolean(this.handle);
  }

  async isSelected() {
    return this.handle.isChecked();
  }

  async selectByAttribute(attribute, value) {
    if (attribute === 'value') {
      await this.handle.selectOption(value);
      return;
    }

    await this.handle.evaluate((select, option) => {
      const match = Array.from(select.options).find(item => item.getAttribute(option.attribute) === option.value);
      if (match) {
        select.value = match.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, { attribute, value });
  }

  async selectByIndex(index) {
    await this.handle.selectOption({ index });
  }

  async setValue(value) {
    if (await this.getAttribute('type') === 'file') {
      await this.handle.setInputFiles(value);
      return;
    }

    await this.handle.fill(value);
  }
}

class Browser {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  async $(selector) {
    return new Element(this.page, await this.page.$(selector));
  }

  async $$(selector) {
    const handles = await this.page.$$(selector);
    return handles.map(handle => new Element(this.page, handle));
  }

  async back() {
    await this.page.goBack();
    await waitForPage(this.page);
  }

  async deleteSession() {
    await this.browser.close();
  }

  async getUrl() {
    return this.page.url();
  }

  // Keep the old test/autofill API while using Playwright's headless browser underneath.
  async goto(targetUrl, input, customVar) {
    return autofill(this)(targetUrl, input, customVar);
  }

  async saveScreenshot(screenshot) {
    await this.page.screenshot({ path: screenshot });
  }

  async submitForm(selector) {
    const form = await this.$(selector);
    const submit = await form.$('input[type="submit"], button[type="submit"]');
    await submit.click();
  }

  async uploadFile(file) {
    return file;
  }

  async url(targetUrl) {
    const url = new URL(targetUrl, this.page.url() || 'http://localhost');
    await this.page.goto(url.toString());
    await waitForPage(this.page);
  }
}

module.exports = async function createBrowser(options = {}) {
  const browser = await chromium.launch({
    headless: options.headless !== false,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  return new Browser(browser, page);
};
