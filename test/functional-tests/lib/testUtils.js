const assert = require('assert');

async function getParsedUrl(browser) {
  return new URL(await browser.getUrl());
}

function assertPathnameEquals(currentUrl, expectedPathname, context) {
  const normalizedExpectedPathname = expectedPathname.startsWith('/')
    ? expectedPathname
    : `/${expectedPathname}`;

  assert.equal(
    currentUrl.pathname,
    normalizedExpectedPathname,
    `[${context}] Expected pathname 
    '${normalizedExpectedPathname}', 
    got '${currentUrl.pathname}' from '${currentUrl.toString()}'`
  );
}

async function gotoAndAssert(browser, gotoUrl, gotoArgs, expectedUrl) {
  await browser.goto(gotoUrl, gotoArgs);
  const currentUrl = await getParsedUrl(browser);
  assertPathnameEquals(currentUrl, expectedUrl, 'gotoAndAssert');
}

async function navigateAndAssert(browser, url, expectedUrl) {
  await browser.url(url);
  const currentUrl = await getParsedUrl(browser);
  assertPathnameEquals(currentUrl, expectedUrl, 'navigateAndAssert');
}

async function fillInputAndSubmit(
  browser,
  selector,
  value,
  submitSelector = 'form'
) {
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

async function selectAndSubmit(
  browser,
  selectSelector,
  index,
  submitSelector = 'form'
) {
  const select = await browser.$(selectSelector);
  await select.selectByIndex(index);
  if (submitSelector) {
    await browser.submitForm(submitSelector);
  }
}

async function retrieveURLAndAssert(browser, expected) {
  const currentUrl = await getParsedUrl(browser);
  assertPathnameEquals(currentUrl, expected, 'retrieveURLAndAssert');
}

async function assertSearchParamEquals(browser, paramName, expectedValue) {
  const currentUrl = await getParsedUrl(browser);
  assert.equal(
    currentUrl.searchParams.get(paramName),
    expectedValue,
    `[assertSearchParamEquals] 
    Expected query param '${paramName}' to equal '${expectedValue}', 
    got '${currentUrl.searchParams.get(paramName)}' from '${currentUrl.toString()}'`
  );
}

async function assertSearchParamMissing(browser, paramName) {
  const currentUrl = await getParsedUrl(browser);
  assert.equal(
    currentUrl.searchParams.get(paramName),
    null,
    `[assertSearchParamMissing] Expected query param '${paramName}' to be missing, 
    got '${currentUrl.searchParams.get(paramName)}' from '${currentUrl.toString()}'`
  );
}

async function assertUrlEquals(browser, expectedUrl, urlNotIncludes) {
  const url = await browser.getUrl();
  assert.equal(
    url,
    expectedUrl,
    `[assertUrlEquals] Expected URL '${expectedUrl}', got '${url}'`
  );
  if (urlNotIncludes) {
    assert.ok(
      !url.includes(urlNotIncludes),
      `[assertUrlEquals] Expected URL '${url}' to not include '${urlNotIncludes}'`
    );
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
  assertSearchParamEquals,
  assertSearchParamMissing,
  assertUrlEquals,
  click,
  getElementValue
};
