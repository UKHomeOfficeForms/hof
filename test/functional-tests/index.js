/* eslint-disable max-len */
'use strict';

// const { browser } = require('./lib/browser');
const App = require('./lib/app');
const assert = require('assert');
const remote = require('webdriverio').remote;

console.log('==0000000==');
describe('tests', () => {
  let browser;
  let app;
  let port = 8080;
  (async () => {
    console.log('==111111==');

    console.log('==222222==');
    try{
      browser = await remote({
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: process.env.CI ? ['headless', 'disable-gpu'] : []
          }
        }
      });
    }catch(err) {
      console.error('err====', err);
    }

    console.log('==333333==');
    console.log('browser ', browser);
  })().catch(err => {
    console.error('err====', err);
    return browser.deleteSession();
  });
  beforeEach( async () => {
    browser.addCommand('goto', require('../../utilities').autofill(browser));
    await browser.url(`http://localhost:${port}`);
    console.log('==444444==');
    return browser;
  });
  console.log('==555555==');
  afterEach(async () => {
    console.log('==666666==');
    await browser.deleteSession();
  });

  describe('#Looping-Behaviour', () => {
    before(() => {
      app = App(require('./apps/default')).listen();
      port = app.address().port;
    });

    after(() => {
      app.close();
    });

    it('can return to a looping step to edit', () => browser.goto('/confirm', { loop: 'no', fork: 'no' })
      .getUrl()
      .then(url => {
        console.log('url===', url);
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

    it('goes back to confirm page after editing first step', () => browser.goto('/confirm', { loop: 'no', fork: 'no' })
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

  describe('#Address-Lookup', () => {
    describe('default address lookup behaviour', () => {
      before(() => {
        app = App(require('./apps/address-lookup-default')({ port })).listen(port);
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('redirects to the address substep on a failed lookup', () => browser.url('/address-default-one')
        .$('input')
        .setValue('BN25 1XY')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('step=address'));
        }));

      it('redirects to the lookup step on a successful lookup', () => browser.url('/address-default-one')
        .$('input')
        .setValue('CR0 2EU')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('step=lookup'));
        }));

      it('fails on an invalid postcode', () => browser.url('/address-default-one')
        .$('input')
        .setValue('INVALID')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('/address-default-one'));
        }));

      it('fails on a non-English postcode', () => browser.url('/address-default-one')
        .$('input')
        .setValue('CH5 1AB')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('/address-default-one'));
        }));

      it('redirects to next step when an address is selected', () => browser.url('/address-default-one')
        .$('input')
        .setValue('CR0 2EU')
        .submitForm('form')
        .selectByIndex('select', 1)
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('/address-default-two'));
        }));

      it('redirects back to postcode step if change link is clicked', () => browser.url('/address-default-one')
        .$('input')
        .setValue('CR0 2EU')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('step=lookup'));
        })
        .$('.change-postcode')
        .click()
        .getUrl()
        .then(url => {
          assert.ok(url.includes('/address-default-one'));
        }));

      it('redirects to manual step if cant-find link is clicked', () => browser.url('/address-default-one')
        .$('input')
        .setValue('CR0 2EU')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('step=lookup'));
        })
        .$('.cant-find')
        .click()
        .getUrl()
        .then(url => {
          assert.ok(url.includes('step=manual'));
        }));

      it('allows user through to next step if no postcode is entered', () => browser.url('/address-default-one')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('/address-default-two'));
        }));

      it('persists address on manual entry step when returning from later step (bugfix)', () => browser.url('/address-default-one')
        .$('a[href*="step=manual"]')
        .click()
        .$('textarea')
        .setValue('1 High Street')
        .submitForm('form')
        .back()
        .getValue('textarea')
        .then(text => {
          assert.equal(text, '1 High Street');
        }));
    });

    describe('required', () => {
      before(() => {
        app = App(require('./apps/required')({ port })).listen(port);
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('throws a validation error if no postcode is entered', () => browser.url('/address-required-one')
        .submitForm('form')
        .getUrl()
        .then(url => {
          assert.ok(url.includes('/address-required-one'));
        }));
    });

    describe('backlink', () => {
      before(() => {
        app = App(require('./apps/backlink')({ port })).listen(port);
        port = app.address().port;
      });

      after(() => {
        app.close();
      });

      it('goes back to postcode step when clicking backlink from the lookup step', () => browser.url('/address-backlink-one')
        .submitForm('form')
        .getUrl()
        .then(url => {
          expect(url).to.include('/address-backlink-two');
        })
        .$('input')
        .setValue('CR0 2EU')
        .submitForm('form')
        .getUrl()
        .then(url => {
          expect(url).to.include('step=lookup');
        })
        .$('#step a')
        .click()
        .getUrl()
      // postcode step does not initially have step=postcode so this cannot be asserted
      // therefore asserting on the premise that it does not have any substep in url
        .then(url => {
          expect(url).to.equal(`http://localhost:${port}/address-backlink-two`);
          expect(url).to.not.include('one');
        }));

      it('goes back to postcode step when clicking backlink from `cant find the address in the list`', () => browser.url('/address-backlink-one')
        .submitForm('form')
        .getUrl()
        .then(url => {
          expect(url).to.include('/address-backlink-two');
        })
        .$('input')
        .setValue('CR0 2EU')
        .submitForm('form')
        .getUrl()
        .then(url => {
          expect(url).to.include('step=lookup');
        })
        .$('.link a.cant-find')
        .click()
        .getUrl()
        .then(url => {
          expect(url).to.include('step=manual');
        })
        .$('#step a')
        .click()
        .getUrl()
      // postcode step does not initially have step=postcode so this cannot be asserted
      // therefore asserting on the premise that it does not have any substep in url
        .then(url => {
          expect(url).to.equal(`http://localhost:${port}/address-backlink-two`);
          expect(url).to.not.include('one');
        }));

      it('goes back to postcode step when clicking backlink from the manual step', () => browser.url('/address-backlink-one')
        .submitForm('form')
        .getUrl()
        .then(url => {
          expect(url).to.include('/address-backlink-two');
        })
        .$('.link a')
        .click()
        .getUrl()
        .then(url => {
          expect(url).to.include('step=manual');
        })
        .$('#step a')
        .click()
        .getUrl()
      // postcode step does not initially have step=postcode so this cannot be asserted
      // therefore asserting on the premise that it does not have any substep in url
        .then(url => {
          expect(url).to.equal(`http://localhost:${port}/address-backlink-two`);
          expect(url).to.not.include('one');
        }));

      it('goes back to postcode step when clicking backlink from the address step (i.e. failed lookup)', () => browser.url('/address-backlink-one')
        .submitForm('form')
        .getUrl()
        .then(url => {
          expect(url).to.include('/address-backlink-two');
        })
        .$('input')
        .setValue('BN25 1XY')
        .submitForm('form')
        .getUrl()
        .then(url => {
          expect(url).to.include('step=address');
        })
        .$('#step a')
        .click()
        .getUrl()
      // postcode step does not initially have step=postcode so this cannot be asserted
      // therefore asserting on the premise that it does not have any substep in url
        .then(url => {
          expect(url).to.equal(`http://localhost:${port}/address-backlink-two`);
          expect(url).to.not.include('one');
        }));
    });
  });
});
