'use strict';

const aggregate = require('../../transpiler/').aggregate;
const path = require('path');

describe('aggregate', () => {
  it('is a function', () => {
    aggregate.should.be.a('function');
  });

  describe('output', () => {
    let output;

    beforeEach(() => {
      output = aggregate(path.resolve(__dirname, '../fixtures/src'));
    });

    it('returns a complete compiled set of translations when called with a directory', () => {
      output.should.have.keys('en', 'ar');
      output.en.should.have.keys('default');
      output.ar.should.have.keys('default');
    });

    it('compiles "en" data correctly', () => {
      output.en.default.should.deep.equal({
        app: {
          title: 'Electronic Visa Waiver'
        },
        buttons: {
          continue: 'Continue',
          send: 'Send',
          change: 'Edit',
          close: 'Close',
          Confirm: 'Confirm details'
        },
        errorlist: {
          title: {
            single: 'Check your answers:',
            multiple: 'Check your answers:'
          }
        }
      });
    });

    it('compiles "ar" data correctly', () => {
      output.ar.default.should.deep.equal({
        app: {
          title: 'Electronic Visa Waiver'
        },
        buttons: {
          continue: 'استمر'
        },
        errorlist: {
          title: {
            single: 'راجع إجاباتك:',
            multiple: 'راجع إجاباتك:'
          }
        }
      });
    });
  });
});
