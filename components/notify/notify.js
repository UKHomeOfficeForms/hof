'use strict';
const NotifyClient = require('notifications-node-client').NotifyClient;
<<<<<<< HEAD
const { v4: uuidv4 } = require('uuid');
=======
const uuid = require('uuid');
>>>>>>> 03704fb (add gov notify to the hof gov notify beta version)

module.exports = class Notify {
  constructor(opts) {
    const options = opts || {};
    this.options = options;
    this.notifyClient =  new NotifyClient(options.notifyApiKey);
    this.notifyTemplate = options.notifyTemplate;
  }

  send(email) {
<<<<<<< HEAD
    const reference = uuidv4();
=======
    const reference = uuid.v1();
>>>>>>> 03704fb (add gov notify to the hof gov notify beta version)

    return this.notifyClient.sendEmail(this.notifyTemplate, email.recipient, {
      personalisation: {
        'email-subject': email.subject,
        'email-body': email.body
      },
      reference });
  }
};

module.exports.NotifyClient = NotifyClient;
