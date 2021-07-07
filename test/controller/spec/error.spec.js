'use strict';

const ErrorClass = require('../../../controller/validation-error');

describe('Error', () => {
  it('sets its key property to the key passed', () => {
    const err = new ErrorClass('field', { type: 'type' });
    err.key.should.equal('field');
  });

  it('sets its type property to the type option passed', () => {
    const err = new ErrorClass('field', { type: 'type' });
    err.type.should.equal('type');
  });

  it('sets its redirect property to the redirect option passed', () => {
    const err = new ErrorClass('field', { redirect: '/foo/bar' });
    err.redirect.should.equal('/foo/bar');
  });

  it('sets its arguments property to the arguments option passed', () => {
    const err = new ErrorClass('field', { type: 'maxlength', arguments: [10] });
    err.arguments.should.eql([10]);
  });
});
