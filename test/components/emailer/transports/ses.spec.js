'use strict';

const proxyquire = require('proxyquire');

describe('transports/ses', () => {

  let nodemailerSesTransport;
  let sesTransport;

  beforeEach(() => {

    nodemailerSesTransport = sinon.stub();

    sesTransport = proxyquire('../../../../components/emailer/transports/ses', {
      'nodemailer-ses-transport': nodemailerSesTransport
    });
  });

  it('returns an instance of ses transport', () => {
    const transport = { transport: 'ses' };
    nodemailerSesTransport.returns(transport);
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar'
    };
    const result = sesTransport(options);
    nodemailerSesTransport.should.have.been.calledWith(sinon.match(options));
    result.should.equal(result);
  });

  it('throws if either accessKeyId or secretAccessKey are not passed', () => {
    const make = opts => {
      return () => sesTransport(opts);
    };
    make({}).should.throw();
    make({ accessKeyId: 'abc123' }).should.throw();
    make({ secretAccessKey: 'abc123' }).should.throw();
  });

  it('region options defaults to `eu-west-1`', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar'
    };
    sesTransport(options);
    nodemailerSesTransport.should.have.been.calledWith(sinon.match({
      region: 'eu-west-1'
    }));
  });

  it('sets region option if it is defined', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      region: 'us-east-1'
    };
    sesTransport(options);
    nodemailerSesTransport.should.have.been.calledWith(sinon.match({
      region: 'us-east-1'
    }));
  });

  it('sets sessionToken option if it is defined', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      sessionToken: 'abc123'
    };
    sesTransport(options);
    nodemailerSesTransport.should.have.been.calledWith(sinon.match({
      sessionToken: 'abc123'
    }));
  });

  it('sets httpOptions option if it is defined', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      httpOptions: { http: 'options' }
    };
    sesTransport(options);
    nodemailerSesTransport.should.have.been.calledWith(sinon.match({
      httpOptions: { http: 'options' }
    }));
  });

  it('sets rateLimit option if it is defined', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      rateLimit: 0
    };
    sesTransport(options);
    nodemailerSesTransport.should.have.been.calledWith(sinon.match({
      rateLimit: 0
    }));
  });

  it('sets maxConnections option if it is defined', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      maxConnections: 0
    };
    sesTransport(options);
    nodemailerSesTransport.should.have.been.calledWith(sinon.match({
      maxConnections: 0
    }));
  });

});
