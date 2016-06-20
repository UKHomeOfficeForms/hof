'use strict';

const redis = require('redis');
const connectRedis = require('connect-redis');
const cookieParser = require('cookie-parser');

module.exports = (app, session, config) => {

  const RedisStore = connectRedis(session);
  const client = redis.createClient(config.redis.port, config.redis.host);

  client.on('error', (e) => {
    throw e;
  });

  const store = new RedisStore({
    client: client,
    ttl: config.session.ttl,
    secret: config.session.secret
  });

  let secure;

  app.use((req, res, next) => {
    secure = req.protocol === 'https' ? true : false;
    next();
  })

  if (secure) {
    app.set('trust proxy', 1);
  }

  const sessionConfig = {
    cookie: {
      secure: secure
    },
    key: config.session.key,
    secret: config.session.secret,
    resave: typeof config.session.resave === 'boolean' ? config.session.resave : true,
    saveUninitialized: typeof config.session.saveUninitialized === 'boolean' ? config.session.saveUninitialized : true
  }

  if (store) {
    sessionConfig.store = store;
  }

  app.use(cookieParser(config.session.secret));
  app.use((req, res, next) => {
    const cookie = res.cookie.bind(res);
    res.cookie = (name, value, options) => {
      options = options || {};
      options.secure = secure;
      options.httpOnly = true;
      options.path = '/';
      cookie(name, value, options);
    };
    next();
  });
  app.use(session(sessionConfig));

};
