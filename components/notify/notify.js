'use strict';
const NotifyClient = require('notifications-node-client').NotifyClient;
const uuid = require('uuid');

module.exports = class Notify {
  constructor(opts) {
    const options = opts || {};
    this.options = options;
    this.notifyClient =  new NotifyClient(options.notifyApiKey);
    this.notifyTemplate = options.notifyTemplate;
  }

  send(email) {
    const reference = uuid.v1();

    return this.notifyClient.sendEmail(this.notifyTemplate, email.recipient, {
      personalisation: {
        'email-subject': email.subject,
        'email-body': email.body
      },
      reference });
  }
};

module.exports.NotifyClient = NotifyClient;
