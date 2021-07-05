'use strict';

const ses = require('nodemailer-ses-transport');

module.exports = (options) => {

  if (!options.accessKeyId) {
    throw new Error('Required option `accessKeyId` not found.');
  }
  if (!options.secretAccessKey) {
    throw new Error('Required option `secretAccessKey` not found.');
  }

  const opts = {
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey
  };

  opts.region = options.region || 'eu-west-1';

  if (options.sessionToken) {
    opts.sessionToken = options.sessionToken;
  }

  if (options.httpOptions) {
    opts.httpOptions = options.httpOptions;
  }

  if (options.rateLimit !== undefined) {
    opts.rateLimit = options.rateLimit;
  }

  if (options.maxConnections !== undefined) {
    opts.maxConnections = options.maxConnections;
  }
  return ses(opts);

};
