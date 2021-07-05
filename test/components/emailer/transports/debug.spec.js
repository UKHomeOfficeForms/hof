'use strict';

const debugTransport = require('../../../../components/emailer/transports/debug');
const fs = require('fs');
const cp = require('child_process');

describe('transports/debug', () => {

  let message;

  beforeEach(() => {
    sinon.stub(fs, 'writeFile').yieldsAsync();
    sinon.stub(fs, 'readFile').yieldsAsync();
    sinon.stub(cp, 'execSync');
    message = {
      data: {
        attachments: []
      },
      message: {
        messageId: () => '<abc123@example.com>'
      },
      resolveContent: sinon.stub().yields(null, '<h1>Hello world</h1>')
    };
  });

  afterEach(() => {
    fs.writeFile.restore();
    fs.readFile.restore();
    cp.execSync.restore();
  });

  it('returns a transport', () => {
    debugTransport({}).should.have.a.property('send');
    debugTransport({}).send.should.be.a('function');
  });

  it('writes the html content to a file', done => {
    debugTransport({ log: false }).send(message, sandbox(err => {
      expect(err).not.to.exist;
      fs.writeFile.should.have.been.calledOnce;
      fs.writeFile.should.have.been.calledWith(sinon.match('abc123.html'), '<h1>Hello world</h1>');
    }, done));
  });

  it('replaces images referencing attachments with the base64 data urls', done => {
    message.resolveContent.yields(null, '<img src="cid:test1" /><img src="cid:test2" />');
    message.data.attachments = [
      { cid: 'test1', path: '/path/to/an/image.png' },
      { cid: 'test2', path: '/path/to/an/image.gif' }
    ];
    fs.readFile.withArgs('/path/to/an/image.png').yieldsAsync(null, 'pngdata');
    fs.readFile.withArgs('/path/to/an/image.gif').yieldsAsync(null, 'gifdata');

    const expectation = '<img src="data:image/png;base64,pngdata" /><img src="data:image/gif;base64,gifdata" />';
    debugTransport({ log: false }).send(message, sandbox(err => {
      expect(err).not.to.exist;
      fs.writeFile.should.have.been.calledOnce;
      fs.writeFile.should.have.been.calledWith(sinon.match('abc123.html'), expectation);
    }, done));
  });

  it('opens the file in a browser if open flag is set', done => {
    debugTransport({ open: true, log: false }).send(message, sandbox(err => {
      expect(err).not.to.exist;
      cp.execSync.should.have.been.calledWith(sinon.match(/^open (.+)abc123.html$/));
    }, done));
  });

});
