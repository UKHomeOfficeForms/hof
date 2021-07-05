'use strict';

const proxyquire = require('proxyquire');

describe('transports/stub', () => {

  let nodemailerStubTransport;
  let stubTransport;

  beforeEach(() => {

    nodemailerStubTransport = sinon.stub();

    stubTransport = proxyquire('../../../../components/emailer/transports/stub', {
      'nodemailer-stub-transport': nodemailerStubTransport
    });
  });

  it('returns an instance of stub transport', () => {
    const transport = { transport: 'stub' };
    nodemailerStubTransport.returns(transport);
    const result = stubTransport();
    nodemailerStubTransport.should.have.been.calledWithExactly();
    result.should.equal(result);
  });

});
