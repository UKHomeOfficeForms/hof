'use strict';

const smtp = require('nodemailer-smtp-transport');

module.exports = (options) => {

  if (!options.host) {
    throw new Error('Required option `host` not found');
  }
  if (!options.port) {
    throw new Error('Required option `port` not found');
  }

  const opts = {
    host: options.host,
    port: options.port
  };

  opts.ignoreTLS = options.ignoreTLS === true;
  opts.secure = options.secure !== false;

  if (options.auth && options.auth.user && options.auth.pass) {
    opts.auth = options.auth;
  }

  return smtp(opts);

};
