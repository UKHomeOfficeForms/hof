'use strict';

const redis = require('redis');
const session = require('express-session');
const connectRedis = require('connect-redis');
const cookieParser = require('cookie-parser');

const secureHttps = config => config.protocol === 'https' || config.env === 'production';

module.exports = (app, config) => {
  const logger = config.logger || console;

  const secretBuffer = Buffer.from(config.session.secret, 'utf8');
  if (secretBuffer.byteLength !== 32) {
    throw new Error(
      `Session secret must be exactly 32 bytes. Current: ${secretBuffer.byteLength} bytes.`
    );
  }

  app.use(cookieParser(config.session.secret, {
    path: '/',
    httpOnly: true,
    secure: secureHttps(config)
  }));

  if (config.sessionStore) {
    return app.use(session({
      store: config.sessionStore,
      genid: () => 'fakeId',
      saveUninitialized: true,
      resave: false
    }));
  }

  const encryption = require('./encryption')(config.session.secret);
  const RedisStore = connectRedis(session);
  const client = redis.createClient(config.redis);

  if (config.env !== 'test') {
    client.on('connecting', () => {
      logger.info('Connecting to redis');
    });

    client.on('connect', () => {
      logger.info('Connected to redis');
    });

    client.on('reconnecting', () => {
      logger.info('Reconnecting to redis');
    });

    client.on('error', e => {
      logger.error(e);
    });
  }

  const store = new RedisStore({
    client: client,
    ttl: config.session.ttl,
    secret: config.session.secret,
    serializer: {
      parse: data => JSON.parse(encryption.decrypt(data)),
      stringify: data => encryption.encrypt(JSON.stringify(data))
    }
  });

  app.set('trust proxy', true);

  const sessionOpts = Object.assign({
    store,
    name: config.session.name,
    cookie: {
      secure: secureHttps(config),
      sameSite: config.cookie?.sameSite === 'lax' ? config.cookie?.sameSite : 'strict',
      httpOnly: true
    },
    secret: config.session.secret,
    saveUninitialized: true,
    resave: true
  }, config.session);

  app.use(session(sessionOpts));

  return client;
};
