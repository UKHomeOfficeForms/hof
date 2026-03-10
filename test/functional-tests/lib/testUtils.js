const assert = require('assert');

async function gotoAndAssert(browser, gotoUrl, gotoArgs, expectedUrl) {
  await browser.goto(gotoUrl, gotoArgs);
  const currentUrl = await browser.getUrl();
  assert.ok(currentUrl.includes(expectedUrl));
}

async function navigateAndAssert(browser, url, expectedUrl, shouldIncludeURL = true) {
  await browser.url(url);
  const currentUrl = await browser.getUrl();
  if (shouldIncludeURL) {
    assert.ok(currentUrl.includes(expectedUrl),
      `[navigateAndAssert] Expected URL to include '${expectedUrl}', got '${currentUrl}'`);
  } else {
    assert.ok(!currentUrl.includes(expectedUrl),
      `[navigateAndAssert] Expected URL to NOT include '${expectedUrl}', got '${currentUrl}'`);
  }
}

async function fillInputAndSubmit(browser, selector, value, submitSelector = 'form') {
  const input = await browser.$(selector);
  const type = await input.getAttribute('type');
  if (type === 'radio' || type === 'checkbox') {
    await input.click();
  } else {
    await input.setValue(value);
  }
  if (submitSelector) {
    await browser.submitForm(submitSelector);
  }
}

async function selectAndSubmit(browser, selectSelector, index, submitSelector = 'form') {
  const select = await browser.$(selectSelector);
  await select.selectByIndex(index);
  if (submitSelector) {
    await browser.submitForm(submitSelector);
  }
}

async function retrieveURLAndAssert(browser, expected) {
  const url = await browser.getUrl();
  assert.ok(url.includes(expected));
}

async function assertUrlEquals(browser, expectedUrl, urlNotIncludes) {
  const url = await browser.getUrl();
  assert.equal(url, expectedUrl);
  if (urlNotIncludes) {
    assert.ok(!url.includes(urlNotIncludes));
  }
}

async function click(browser, selector) {
  const element = await browser.$(selector);
  await element.click();
}

async function getElementValue(browser, selector) {
  const element = await browser.$(selector);
  return element.getValue();
}

module.exports = {
  gotoAndAssert,
  navigateAndAssert,
  fillInputAndSubmit,
  selectAndSubmit,
  retrieveURLAndAssert,
  assertUrlEquals,
  click,
  getElementValue
};
