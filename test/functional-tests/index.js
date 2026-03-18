/* eslint-disable max-len */
'use strict';

const Browser = require('./lib/browser');
const App = require('./lib/app');
const assert = require('assert');
const testUtils = require('./lib/testUtils');

describe('tests', () => {
  let browser;
  let app;
  let port = 8080;

  beforeEach(async () => {
    browser = await Browser();
    await browser.url(`http://localhost:${port}`);
  });

  afterEach(async () => {
    if (browser && browser.deleteSession) {
      await browser.deleteSession();
    }
  });

  describe('#Looping-Behaviour', () => {
    before(() => {
      app = App(require('./apps/default')).listen();
      port = app.address().port;
    });

    after(() => {
      app.close();
    });

    it('can return to a looping step to edit', async () => {
      await testUtils.gotoAndAssert(browser, '/confirm', { loop: 'no', fork: 'no' }, '/confirm');
      await testUtils.navigateAndAssert(browser, `http://localhost:${port}/two/edit`, '/two/edit');
    });

    it('prevents accessing a looping step once the loop has been started', async () => {
      await testUtils.gotoAndAssert(browser, '/two', undefined, '/two');
      await testUtils.fillInputAndSubmit(browser, 'input[name="loop"][value="yes"]', null);
      await browser.submitForm('form');
      await testUtils.retrieveURLAndAssert(browser, '/one-a');
      await testUtils.navigateAndAssert(browser, `http://localhost:${port}/two`, '/one-a');
    });

    it('cannot go back to confirm page after editing a fork', async () => {
      await testUtils.gotoAndAssert(browser, '/confirm', { loop: 'no', fork: 'no' }, 'confirm');
      await testUtils.navigateAndAssert(browser, `http://localhost:${port}/three/edit`, '/three/edit');
      await testUtils.fillInputAndSubmit(browser, 'input[name="fork"][value="yes"]', null);
      await testUtils.retrieveURLAndAssert(browser, '/four-2/edit');
      await testUtils.navigateAndAssert(browser, `http://localhost:${port}/confirm`, '/four-1');
    });

    it('goes back to confirm page after editing first step', async () => {
      await testUtils.gotoAndAssert(browser, '/confirm', { loop: 'no', fork: 'no' }, 'confirm');
      await testUtils.navigateAndAssert(browser, `http://localhost:${port}/one/edit`, '/one/edit');
      await browser.submitForm('form');
      await testUtils.retrieveURLAndAssert(browser, '/confirm');
    });

    it('redirects confirmation route requests to the confirm page', async () => {
      await testUtils.gotoAndAssert(browser, '/confirm', { loop: 'no', fork: 'no' }, 'confirm');
      await testUtils.navigateAndAssert(browser, `http://localhost:${port}/confirmation`, '/confirm');
    });

    describe('with loop preceding confirm page', () => {
      before(() => {
        app = App(require('./apps/loop-before-confirm')).listen();
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('allows returning to the confirmation page from a loop page in an edit journey', async () => {
        await testUtils.gotoAndAssert(browser, '/confirm', undefined, '/confirm');
        await testUtils.navigateAndAssert(browser, `http://localhost:${port}/two/edit`, '/two/edit');
        await testUtils.fillInputAndSubmit(browser, 'input[name="loop"][value="no"]', null);
        await testUtils.retrieveURLAndAssert(browser, '/confirm');
      });
    });

    describe('with looping step before and after the loop', () => {
      before(() => {
        app = App(require('./apps/looping-step-before-loop')).listen();
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('allows accessing the loop through first looping step', async () => {
        await testUtils.navigateAndAssert(browser, `http://localhost:${port}/loop`, '/loop');
        await testUtils.fillInputAndSubmit(browser, 'input[name="loop"][value="yes"]', null);
        await testUtils.retrieveURLAndAssert(browser, '/two');
      });
    });

    describe('configurable confirm step url', () => {
      before(() => {
        app = App(require('./apps/custom-confirm-step')).listen();
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('allows accessing the loop through first looping step', async () => {
        await testUtils.gotoAndAssert(browser, '/summary', undefined, '/summary');
        await testUtils.navigateAndAssert(browser, `http://localhost:${port}/two/edit`, '/two/edit');
        await browser.submitForm('form');
        await testUtils.retrieveURLAndAssert(browser, '/summary');
      });
    });
  });

  describe('#Address-Lookup', () => {
    describe('default address lookup behaviour', () => {
      before(() => {
        app = App(require('./apps/address-lookup-default')({ port })).listen(port);
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('redirects to the address substep on a failed lookup', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.fillInputAndSubmit(browser, 'input', 'BN25 1XY');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'address');
      });

      it('redirects to the lookup step on a successful lookup', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.fillInputAndSubmit(browser, 'input', 'CR0 2EU');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'lookup');
      });

      it('fails on an invalid postcode', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.fillInputAndSubmit(browser, 'input', 'INVALID');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamMissing(browser, 'step');
      });

      it('fails on a non-English postcode', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.fillInputAndSubmit(browser, 'input', 'CH5 1AB');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamMissing(browser, 'step');
      });

      it('redirects to next step when an address is selected', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.fillInputAndSubmit(browser, 'input', 'CR0 2EU');
        await testUtils.selectAndSubmit(browser, 'select', 1);
        await testUtils.retrieveURLAndAssert(browser, '/address-default-two');
      });

      it('redirects back to postcode step if change link is clicked', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.fillInputAndSubmit(browser, 'input', 'CR0 2EU');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'lookup');
        await testUtils.click(browser, '.change-postcode');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'postcode');
      });

      it('redirects to manual step if cant-find link is clicked', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.fillInputAndSubmit(browser, 'input', 'CR0 2EU');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'lookup');
        await testUtils.click(browser, '.cant-find');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'manual');
      });

      it('allows user through to next step if no postcode is entered', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await browser.submitForm('form');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-two');
      });

      it('persists address on manual entry step when returning from later step (bugfix)', async () => {
        await testUtils.navigateAndAssert(browser, '/address-default-one', '/address-default-one');
        await testUtils.click(browser, 'a[href*="step=manual"]');
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'manual');
        await testUtils.fillInputAndSubmit(browser, 'textarea', '1 High Street');
        await browser.back();
        await testUtils.retrieveURLAndAssert(browser, '/address-default-one');
        await testUtils.assertSearchParamEquals(browser, 'step', 'manual');
        const text = await testUtils.getElementValue(browser, 'textarea');
        assert.equal(text, '1 High Street');
      });
    });

    describe('required', () => {
      before(() => {
        app = App(require('./apps/required')({ port })).listen(port);
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('throws a validation error if no postcode is entered', async () => {
        await testUtils.navigateAndAssert(browser, '/address-required-one', '/address-required-one');
        await browser.submitForm('form');
        await testUtils.retrieveURLAndAssert(browser, '/address-required-one');
      });
    });

    describe('backlink', () => {
      before(() => {
        app = App(require('./apps/backlink')({ port })).listen(port);
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('goes back to postcode step when clicking backlink from the lookup step', async () => {
        await testUtils.navigateAndAssert(browser, '/address-backlink-one', '/address-backlink-one');
        await browser.submitForm('form');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.fillInputAndSubmit(browser, 'input', 'CR0 2EU');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.assertSearchParamEquals(browser, 'step', 'lookup');
        await testUtils.click(browser, '#step a');
        await testUtils.assertUrlEquals(browser, `http://localhost:${port}/address-backlink-two`, 'one');
      });

      it('goes back to postcode step when clicking backlink from `cant find the address in the list`', async () => {
        await testUtils.navigateAndAssert(browser, '/address-backlink-one', '/address-backlink-one');
        await browser.submitForm('form');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.fillInputAndSubmit(browser, 'input', 'CR0 2EU');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.assertSearchParamEquals(browser, 'step', 'lookup');
        await testUtils.click(browser, '.link a.cant-find');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.assertSearchParamEquals(browser, 'step', 'manual');
        await testUtils.click(browser, '#step a');
        await testUtils.assertUrlEquals(browser, `http://localhost:${port}/address-backlink-two`, 'one');
      });

      it('goes back to postcode step when clicking backlink from the manual step', async () => {
        await testUtils.navigateAndAssert(browser, '/address-backlink-one', '/address-backlink-one');
        await browser.submitForm('form');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.click(browser, '.link a');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.assertSearchParamEquals(browser, 'step', 'manual');
        await testUtils.click(browser, '#step a');
        await testUtils.assertUrlEquals(browser, `http://localhost:${port}/address-backlink-two`, 'one');
      });

      it('goes back to postcode step when clicking backlink from the address step (i.e. failed lookup)', async () => {
        await testUtils.navigateAndAssert(browser, '/address-backlink-one', '/address-backlink-one');
        await browser.submitForm('form');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.fillInputAndSubmit(browser, 'input', 'BN25 1XY');
        await testUtils.retrieveURLAndAssert(browser, '/address-backlink-two');
        await testUtils.assertSearchParamEquals(browser, 'step', 'address');
        await testUtils.click(browser, '#step a');
        await testUtils.assertUrlEquals(browser, `http://localhost:${port}/address-backlink-two`, 'one');
      });
    });
  });
});
