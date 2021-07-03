'use strict';

const Browser = require('./lib/browser');
const App = require('./lib/app');
const assert = require('assert');

describe('tests', () => {
  let browser;
  let app;
  let port;

  before(() => {
    app = App(require('./apps/default')).listen();
    port = app.address().port;
  });

  after(() => {
    app.close();
  });

  beforeEach(() => {
    browser = Browser().url(`http://localhost:${port}`);
    return browser;
  });

  afterEach(() => browser.end());

  it('can return to a looping step to edit', () => browser.goto('/confirm', { loop: 'no', fork: 'no' })
    .getUrl()
    .then(url => {
      assert.ok(url.includes('/confirm'));
    })
    .url(`http://localhost:${port}/two/edit`)
    .getUrl()
    .then(url => {
      assert.ok(url.includes('/two/edit'));
    }));

  it('prevents accessing a looping step once the loop has been started', () => browser.goto('/two')
    .$('input[name="loop"][value="yes"]').click()
    .submitForm('form')
    .submitForm('form')
    .getUrl()
    .then(url => {
      assert.ok(url.includes('/one-a'));
    })
    .url(`http://localhost:${port}/two`)
    .getUrl()
    .then(url => {
      assert.ok(!url.includes('/two'));
      assert.ok(url.includes('/one'));
    }));

  it('cannot go back to confirm page after editing a fork', () => browser.goto('/confirm', { loop: 'no', fork: 'no' })
    .getUrl()
    .then(url => {
      assert.ok(url.includes('confirm'));
    })
    .url(`http://localhost:${port}/three/edit`)
    .$('input[name="fork"][value="yes"]').click()
    .submitForm('form')
    .url(`http://localhost:${port}/confirm`)
    .getUrl()
    .then(url => {
      assert.ok(!url.includes('/confirm'));
    }));

  it('can go back to confirm page after editing first step', () => browser.goto('/confirm', { loop: 'no', fork: 'no' })
    .getUrl()
    .then(url => {
      assert.ok(url.includes('confirm'));
    })
    .url(`http://localhost:${port}/one/edit`)
    .submitForm('form')
    .getUrl()
    .then(url => {
      assert.ok(url.includes('/confirm'));
    }));

  it('does not autocomplete confirm page', () => browser.goto('/confirm', { loop: 'no', fork: 'no' })
    .getUrl()
    .then(url => {
      assert.ok(url.includes('confirm'));
    })
    .url(`http://localhost:${port}/confirmation`)
    .getUrl()
    .then(url => {
      assert.ok(url.includes('/confirm'));
    }));

  describe('with loop preceding confirm page', () => {
    before(() => {
      app = App(require('./apps/loop-before-confirm')).listen();
      port = app.address().port;
    });

    after(() => {
      app.close();
    });

    it('allows returning to the confirmation page from a loop page in an edit journey', () => browser.goto('/confirm')
      .url(`http://localhost:${port}/two/edit`)
      .$('input[name="loop"][value="no"]').click()
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('/confirm'));
      }));
  });

  describe('with looping step before and after the loop', () => {
    before(() => {
      app = App(require('./apps/looping-step-before-loop')).listen();
      port = app.address().port;
    });

    after(() => {
      app.close();
    });

    it('allows accessing the loop through first looping step', () => browser.url(`http://localhost:${port}/loop`)
      .$('input[name="loop"][value="yes"]').click()
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('/two'));
      }));
  });

  describe('configurable confirm step url', () => {
    before(() => {
      app = App(require('./apps/custom-confirm-step')).listen();
      port = app.address().port;
    });

    after(() => {
      app.close();
    });

    it('allows accessing the loop through first looping step', () => browser.goto('/summary')
      .url(`http://localhost:${port}/two/edit`)
      .submitForm('form')
      .getUrl()
      .then(url => {
        assert.ok(url.includes('/summary'));
      }));
  });
});
