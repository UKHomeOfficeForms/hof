'use strict';

const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

module.exports = options => {
  if (!options.accessKeyId) {
    throw new Error('Required option `accessKeyId` not found.');
  }
  if (!options.secretAccessKey) {
    throw new Error('Required option `secretAccessKey` not found.');
  }

  const credentials = {
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey
  };

  if (options.sessionToken) {
    credentials.sessionToken = options.sessionToken;
  }

  const clientOptions = {
    region: options.region || 'eu-west-1',
    credentials
  };

  // Legacy v2-style http options are accepted as top-level client overrides.
  if (options.httpOptions && typeof options.httpOptions === 'object') {
    Object.assign(clientOptions, options.httpOptions);
  }

  return {
    SES: {
      sesClient: new SESv2Client(clientOptions),
      SendEmailCommand
    }
  };
};
