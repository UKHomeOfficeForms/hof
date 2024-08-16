'use strict';
/* eslint-disable no-console */
const NotifyClient = require('notifications-node-client').NotifyClient;
const { v4: uuidv4 } = require('uuid');

module.exports = class Notify {
  constructor(opts) {
    const options = opts || {};
    this.options = options;
    this.notifyClient =  new NotifyClient(options.notifyApiKey);
    this.notifyTemplate = options.notifyTemplate;
  }

  async sendEmail(templateId, recipient, personalisation) {
    const reference = uuidv4();

    try {
      await this.notifyClient.sendEmail(templateId, recipient, {
        personalisation: personalisation,
        reference });
    } catch (error) {
      console.error('Error sending email:', error.response ? error.response.data : error.message);
    }
  }

  send(email) {
    let personalisation = {
      'email-subject': email.subject,
      'email-body': email.body
    };

    if (email.attachment && email.attachment !== undefined) {
      personalisation = Object.assign({'email-attachment':
        this.notifyClient.prepareUpload(email.attachment)}, personalisation);
    }

    this.sendEmail(this.notifyTemplate, email.recipient, personalisation);
  }
};

module.exports.NotifyClient = NotifyClient;
