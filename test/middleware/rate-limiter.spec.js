'use strict';

const moment = require('moment');

describe('rate-limiter', () => {
  let req;
  let res;
  let next;
  let loggerStub;
  let rateLimiter;
  let getStub;
  let setStub;
  let quitStub;
  let connectStub;
  let onStub;
  let mockOptions;

  const staticTimeDay = '2022-05-16 12:00';

  beforeEach(() => {
    req = request();
    res = response();
    next = sinon.stub();
    loggerStub = sinon.stub();
    getStub = sinon.stub();
    setStub = sinon.stub();
    quitStub = sinon.stub();
    connectStub = sinon.stub();
    onStub = sinon.stub();

    req.ip = 'default';

    const defaultMockData = [{
      requestsTimeStamp: moment(staticTimeDay).subtract(2, 'minute').unix(),
      requestsCount: 2
    }];

    const oldMockData = [{
      requestsTimeStamp: moment(staticTimeDay).subtract(6, 'minutes').unix(),
      requestsCount: 20
    }];

    const recentMockData = [{
      requestsTimeStamp: moment(staticTimeDay).unix(),
      requestsCount: 20
    }];

    const submissionMockData = [{
      submissionsTimeStamp: moment(staticTimeDay).subtract(2, 'minute').unix(),
      submissionsCount: 100
    }];

    getStub.withArgs('default').yields(null, JSON.stringify(defaultMockData));
    getStub.withArgs('old_records').yields(null, JSON.stringify(oldMockData));
    getStub.withArgs('recent_records').yields(null, JSON.stringify(recentMockData));
    getStub.withArgs('submission_records').yields(null, JSON.stringify(submissionMockData));
    getStub.withArgs('no_records').yields(null, null);
    getStub.withArgs('error').yields('RedisError');

    mockOptions = {
      logger: { log: loggerStub },
      rateLimits: {
        env: 'production',
        requests: {
          active: false,
          windowSizeInMinutes: 5,
          maxWindowRequestCount: 100,
          windowLogIntervalInMinutes: 1,
          errCode: 'DDOS_RATE_LIMIT'
        },
        submissions: {
          active: false,
          windowSizeInMinutes: 10,
          maxWindowRequestCount: 1,
          windowLogIntervalInMinutes: 1,
          errCode: 'SUBMISSION_RATE_LIMIT'
        }
      }
    };

    rateLimiter = proxyquire('../middleware/rate-limiter', {
      redis: {
        createClient: () => {
          return { set: setStub, connect: connectStub.resolves(),get: getStub,
            v4: {
              QUIT: quitStub
            },
            legacyMode: true,
            on: onStub
           };
        },
      },
      moment: () => moment(staticTimeDay)
    });
  });

  it('logs an error and returns if no redis client is present', () => {
    rateLimiter = proxyquire('../middleware/rate-limiter', {
      redis: { 
        createClient: () => null,
        on: onStub
       }
    });

    rateLimiter(mockOptions, 'requests')(req, res, next);

    loggerStub.should.have.been.calledOnce.calledWithExactly('error', 'Redis client does not exist!');
    getStub.should.not.have.been.called;
    setStub.should.not.have.been.called;
    quitStub.should.not.have.been.called;
    next.should.have.been.calledOnce.calledWithExactly();
  });

  it('logs an error and returns if their is a Redis get error', async () => {
    req.ip = 'error';
    await rateLimiter(mockOptions, 'requests')(req, res, next);

    const errMsg = 'Error with requesting redis session for rate limiting: RedisError';

    loggerStub.should.have.been.calledOnce.calledWithExactly(req.ip, errMsg);
    getStub.should.have.been.calledOnce;
    setStub.should.not.have.been.called;
    quitStub.should.have.been.calledOnce.calledWithExactly();
    next.should.have.been.calledOnce.calledWithExactly(undefined);
  });

  it('adds a new record if one does not exist', async () => {
    req.ip = 'no_records';
    await rateLimiter(mockOptions, 'requests')(req, res, next);

    const data = JSON.stringify([{
      requestsTimeStamp: moment(staticTimeDay).unix(),
      requestsCount: 1
    }]);

    loggerStub.should.not.have.been.called;
    getStub.should.have.been.calledOnce;
    setStub.should.have.been.calledOnce.calledWithExactly(req.ip, data);
    quitStub.should.have.been.calledOnce.calledWithExactly();
    connectStub.should.have.been.calledOnce;
    next.should.have.been.calledOnce.calledWithExactly(undefined);
  });

  it('ignores out of date records and sets a new one', async () => {
    req.ip = 'old_records';
    await rateLimiter(mockOptions, 'requests')(req, res, next);

    const data = JSON.stringify([{
      requestsTimeStamp: moment(staticTimeDay).unix(),
      requestsCount: 1
    }]);

    loggerStub.should.not.have.been.called;
    getStub.should.have.been.calledOnce;
    setStub.should.have.been.calledOnce.calledWithExactly(req.ip, data);
    quitStub.should.have.been.calledOnce.calledWithExactly();
    connectStub.should.have.been.calledOnce;
    next.should.have.been.calledOnce.calledWithExactly(undefined);
  });

  it('does not log requests made if running in production mode', async () => {
    await rateLimiter(mockOptions, 'requests')(req, res, next);
    connectStub.should.have.been.calledOnce;
    loggerStub.should.not.have.been.called;
  });

  it('logs requests made if running in development mode', async () => {
    mockOptions.rateLimits.env = 'development';
    await rateLimiter(mockOptions, 'requests')(req, res, next);
    connectStub.should.have.been.calledOnce;

    const reqMsg = 'Requests made by client: 2\nRequests remaining: 98';
    loggerStub.should.have.been.calledOnce.calledWithExactly('info', reqMsg);
  });

  it('logs requests made if Node environment not set', async () => {
    mockOptions.rateLimits.env = null;
    await rateLimiter(mockOptions, 'requests')(req, res, next);
    connectStub.should.have.been.calledOnce;

    const reqMsg = 'Requests made by client: 2\nRequests remaining: 98';
    loggerStub.should.have.been.calledOnce.calledWithExactly('info', reqMsg);
  });

  it('calls the callback with an error if request rate limit hit', async () => {
    mockOptions.rateLimits.requests.maxWindowRequestCount = 1;
    await rateLimiter(mockOptions, 'requests')(req, res, next);

    loggerStub.should.not.have.been.called;
    getStub.should.have.been.calledOnce;
    setStub.should.not.have.been.called;
    quitStub.should.have.been.calledOnce.calledWithExactly();
    connectStub.should.have.been.calledOnce;
    next.should.have.been.calledOnce.calledWithExactly({ code: 'DDOS_RATE_LIMIT' });
  });

  it('calls the callback with an error if any other submission type rate limit hit', async () => {
    req.ip = 'submission_records';
    mockOptions.rateLimits.submissions.maxWindowRequestCount = 99;
    await rateLimiter(mockOptions, 'submissions')(req, res, next);

    loggerStub.should.not.have.been.called;
    getStub.should.have.been.calledOnce;
    setStub.should.not.have.been.called;
    quitStub.should.have.been.calledOnce.calledWithExactly();
    connectStub.should.have.been.calledOnce;
    next.should.have.been.calledOnce.calledWithExactly({ code: 'SUBMISSION_RATE_LIMIT' });
  });

  it('splits out requests made within rate limit window by intervals', async () => {
    await rateLimiter(mockOptions, 'requests')(req, res, next);

    const data = JSON.stringify([{
      requestsTimeStamp: moment(staticTimeDay).subtract(2, 'minutes').unix(),
      requestsCount: 2
    }, {
      requestsTimeStamp: moment(staticTimeDay).subtract(1, 'minute').unix(),
      requestsCount: 1
    }]);

    loggerStub.should.not.have.been.called;
    getStub.should.have.been.calledOnce;
    setStub.should.have.been.calledOnce.calledWithExactly('default', data);
    quitStub.should.have.been.calledOnce.calledWithExactly();
    connectStub.should.have.been.calledOnce;
    next.should.have.been.calledOnce.calledWithExactly(undefined);
  });

  it('tallies up recent requests if within the same interval window', async () => {
    req.ip = 'recent_records';
    await rateLimiter(mockOptions, 'requests')(req, res, next);

    const data = JSON.stringify([{
      requestsTimeStamp: moment(staticTimeDay).unix(),
      requestsCount: 21
    }]);

    loggerStub.should.not.have.been.called;
    getStub.should.have.been.calledOnce;
    setStub.should.have.been.calledOnce.calledWithExactly('recent_records', data);
    quitStub.should.have.been.calledOnce.calledWithExactly();
    connectStub.should.have.been.calledOnce;
    next.should.have.been.calledOnce.calledWithExactly(undefined);
  });

  it('can successfully add and handle other rate limits', async () => {
    req.ip = 'submission_records';
    mockOptions.rateLimits.submissions.maxWindowRequestCount = 101;
    await rateLimiter(mockOptions, 'submissions')(req, res, next);

    const data = JSON.stringify([{
      submissionsTimeStamp: moment(staticTimeDay).subtract(2, 'minute').unix(),
      submissionsCount: 100
    }, {
      submissionsTimeStamp: moment(staticTimeDay).subtract(1, 'minute').unix(),
      submissionsCount: 1
    }]);

    loggerStub.should.not.have.been.called;
    getStub.should.have.been.calledOnce;
    setStub.should.have.been.calledOnce.calledWithExactly('submission_records', data);
    quitStub.should.have.been.calledOnce.calledWithExactly();
    connectStub.should.have.been.calledOnce;
    next.should.have.been.calledOnce.calledWithExactly(undefined);
  });

  it('calls the callback with an error in the event of a fail', async () => {
    quitStub = sinon.stub();

    rateLimiter = proxyquire('../middleware/rate-limiter', {
      redis: {
        createClient: () => {
          return { connect: connectStub,get: () => {
            throw new Error('FAIL');
          }, v4: {
            QUIT: quitStub
           }, 
           on: onStub
          };
        }
      }
    });

    await rateLimiter(mockOptions, 'requests')(req, res, next);

    loggerStub.should.not.have.been.called;
    setStub.should.not.have.been.called;
    next.should.have.been.calledOnce;

    const errArg = next.firstCall.args[0];
    expect(errArg).to.be.instanceof(Error);
    expect(errArg.message).to.equal('FAIL');
    quitStub.should.have.been.calledOnce.calledWithExactly();
  });
});
