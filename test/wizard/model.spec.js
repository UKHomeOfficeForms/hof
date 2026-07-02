'use strict';

const SessionModel = require('../../wizard/model');

describe('wizard/model', () => {
  it('throws when key is missing', () => {
    const fn = () => new SessionModel({}, {
      session: {}
    });

    fn.should.throw('session-model - key must be defined');
  });

  ['__proto__', 'prototype', 'constructor'].forEach(unsafeKey => {
    it(`throws when key is unsafe: ${unsafeKey}`, () => {
      const fn = () => new SessionModel({}, {
        session: {},
        key: unsafeKey
      });

      fn.should.throw('session-model - key must not be __proto__, prototype, or constructor');
    });
  });

  it('initialises a safe key namespace on session', () => {
    const session = {};

    const model = new SessionModel({}, {
      session,
      key: 'hof-wizard-safe'
    });

    model.should.be.an('object');
    session['hof-wizard-safe'].should.eql({});
  });
});
