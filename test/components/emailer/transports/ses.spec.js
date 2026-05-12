'use strict';

const proxyquire = require('proxyquire').noCallThru();

describe('transports/ses', () => {
  let SESv2Client;
  let SendEmailCommand;
  let sesClient;
  let sesTransport;

  beforeEach(() => {
    sesClient = { name: 'ses-client' };
    SESv2Client = sinon.stub().returns(sesClient);
    SendEmailCommand = function MockSendEmailCommand() {};

    sesTransport = proxyquire('../../../../components/emailer/transports/ses', {
      '@aws-sdk/client-sesv2': {
        SESv2Client,
        SendEmailCommand
      }
    });
  });

  it('returns an instance of ses transport', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar'
    };

    const result = sesTransport(options);

    SESv2Client.should.have.been.calledWith(sinon.match({
      region: 'eu-west-1',
      credentials: {
        accessKeyId: 'foo',
        secretAccessKey: 'bar'
      }
    }));
    result.should.deep.equal({
      SES: {
        sesClient,
        SendEmailCommand
      }
    });
  });

  it('throws if either accessKeyId or secretAccessKey are not passed', () => {
    const make = opts => () => sesTransport(opts);
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

    SESv2Client.should.have.been.calledWith(sinon.match({
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

    SESv2Client.should.have.been.calledWith(sinon.match({
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

    SESv2Client.should.have.been.calledWith(sinon.match({
      credentials: {
        accessKeyId: 'foo',
        secretAccessKey: 'bar',
        sessionToken: 'abc123'
      }
    }));
  });

  it('sets httpOptions option if it is defined', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      httpOptions: { http: 'options' }
    };

    sesTransport(options);

    SESv2Client.should.have.been.calledWith(sinon.match({
      http: 'options'
    }));
  });

  it('ignores legacy rateLimit and maxConnections options', () => {
    const options = {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
      rateLimit: 10,
      maxConnections: 0
    };

    sesTransport(options);

    const clientOptions = SESv2Client.firstCall.args[0];
    should.equal(clientOptions.rateLimit, undefined);
    should.equal(clientOptions.maxConnections, undefined);
  });
});
