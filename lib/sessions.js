'use strict';

const redis = require('redis');
const session = require('express-session');
const connectRedis = require('connect-redis');
const cookieParser = require('cookie-parser');

module.exports = (app, config) => {

  const logger = config.logger;

  const encryption = require('./encryption')(config.session.secret);
  const RedisStore = connectRedis(session);
  const client = redis.createClient(config.redis.port, config.redis.host);

  client.on('connecting', function redisConnecting() {
    logger.info('Connecting to redis');
  });

  client.on('connect', function redisConnected() {
    logger.info('Connected to redis');
  });

  client.on('reconnecting', function redisReconnecting() {
    logger.info('Reconnecting to redis');
  });

  client.on('error', function clientErrorHandler(e) {
    logger.error(e);
  });

  const store = new RedisStore({
    client: client,
    ttl: config.session.ttl,
    secret: config.session.secret,
    serializer: {
      parse: (data) => JSON.parse(encryption.decrypt(data)),
      stringify: (data) => encryption.encrypt(JSON.stringify(data))
    }
  });

  app.set('trust proxy', 1);

  app.use(cookieParser(config.session.secret, {
    path: '/',
    httpOnly: true,
    secure: config.protocol === 'https'
  }));

  const sessionOpts = Object.assign({
    store,
    name: config.session.name,
    cookie: {secure: config.protocol === 'https'},
    secret: config.session.secret,
    saveUninitialized: true,
    resave: true,
  }, config.session);

  app.use(session(sessionOpts));

};
