'use strict';

const { remote } = require('webdriverio');
const autofill = require('../../../utilities/autofill');

const defaultOptions = {
  logLevel: 'error',
  capabilities: {
    browserName: 'chrome'
  }
};

module.exports = async function createBrowser(options = {}) {
  const client = await remote({ ...defaultOptions, ...options });

  // Custom command used throughout the functional tests to autofill journeys
  client.addCommand('goto', async function (targetUrl, input, customVar) {
    return autofill(this)(targetUrl, input, customVar);
  });

  // Provide a browser-level submitForm helper for tests that
  // clicks the submit button within the given form selector
  client.addCommand('submitForm', async function (selector) {
    const form = await this.$(selector);
    const submit = await form.$('input[type="submit"], button[type="submit"]');
    await submit.click();
  });

  return client;
};
