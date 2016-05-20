'use strict';

const redis = require('redis');
const connectRedisCrypto = require('connect-redis-crypto');
const cookieParser = require('cookie-parser');
const session = require('express-session');

module.exports = (app, config) => {

  const RedisStore = connectRedisCrypto(session);
  const client = redis.createClient(config.redis.port, config.redis.host);

  client.on('error', (e) => {
    throw e;
  });

  const redisStore = new RedisStore({
    client: client,
    ttl: config.session.ttl,
    secret: config.session.secret
  });

  function secureCookies(req, res, next) {
    const cookie = res.cookie.bind(res);
    res.cookie = (name, value, options) => {
      options = options || {};
      options.secure = (req.protocol === 'https');
      options.httpOnly = true;
      options.path = '/';
      cookie(name, value, options);
    };
    next();
  }

  app.use(cookieParser(config.session.secret));
  app.use(secureCookies);
  app.use(session({
    store: redisStore,
    cookie: {
      secure: (config.env === 'development' || config.env === 'docker' || config.env === 'ci') ? false : true
    },
    key: config.session.key,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true
  }));

  return app;
};
