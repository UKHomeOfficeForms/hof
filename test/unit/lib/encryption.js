'use strict';

const proxyquire = require('proxyquire');
const password = 'the-password';
const algorithm = 'aes-256-ctr';


describe('encryption', () => {
  const crypto = {};
  let encryption;
  let update;
  let final;

  beforeEach(() => {
    final = sinon.stub().returns('');
    update = sinon.stub().returns('');
    crypto.createCipher = sinon.stub().returns({
      update,
      final
    });
    crypto.createDecipher = sinon.stub().returns({
      update,
      final
    });
    encryption = proxyquire('../../../lib/encryption', {crypto});
  });

  it('is a function', () => {
    encryption.should.be.a('function');
  });

  it('expects 1 argument', () => {
    encryption.length.should.be.equal(1);
  });

  describe('with password', () => {
    let enc;

    beforeEach(() => {
      enc = encryption(password);
    });

    it('has an encrypt function', () => {
      enc.encrypt.should.be.a('function');
    });

    it('has an decrypt function', () => {
      enc.decrypt.should.be.a('function');
    });

    describe('encrypt', () => {
      it('calls crypto.createCipher with algorithm and password', () => {
        enc.encrypt('something');
        crypto.createCipher.should.have.been.calledOnce
          .and.calledWithExactly(algorithm, password);
      });

      it('calls update with value passed, utf8 and hex', () => {
        enc.encrypt('something');
        update.should.have.been.calledOnce
          .and.calledWithExactly('something', 'utf8', 'hex');
      });

      it('calls final with hex', () => {
        enc.encrypt('something');
        final.should.have.been.calledOnce
          .and.calledWithExactly('hex');
      });
    });

    describe('decrypt', () => {
      it('calls crypto.createDecipher with algorithm and password', () => {
        enc.decrypt('something');
        crypto.createDecipher.should.have.been.calledOnce
          .and.calledWithExactly(algorithm, password);
      });

      it('calls update with value passed, hex and utf8', () => {
        enc.decrypt('something');
        update.should.have.been.calledOnce
          .and.calledWithExactly('something', 'hex', 'utf8');
      });

      it('calls final with hex', () => {
        enc.decrypt('something');
        final.should.have.been.calledOnce
          .and.calledWithExactly('utf8');
      });
    });
  });
});
