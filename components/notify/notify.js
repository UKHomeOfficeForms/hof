'use strict';

const NotifyClient = require('notifications-node-client').NotifyClient;
const { randomUUID } = require('node:crypto');
const config = require('../../config/hof-defaults');
const logger = require('../../lib/logger');

module.exports = class Notify {
  constructor(opts) {
    const options = opts || {};
    this.options = options;
    this.logger = logger(config);
    this.notifyClient = new NotifyClient(options.notifyApiKey);
    this.notifyTemplate = options.notifyTemplate;
  }

  async sendEmail(templateId, recipient, personalisation) {
    const reference = randomUUID();

    try {
      await this.notifyClient.sendEmail(templateId, recipient, {
        personalisation: personalisation,
        reference
      });
      this.logger.log('info', 'Email sent');
    } catch (error) {
      this.logger.log(
        'error',
        error.response ? error.response.data : error.message
      );
      // Preserve the original Notify error and its response payload.
      throw error;
    }
  }

  async send(email) {
    const personalisation = {
      'email-subject': email.subject,
      'email-body': email.body
    };

    if (email.attachment) {
      personalisation['email-attachment'] = this.notifyClient.prepareUpload(
        email.attachment
      );
    }

    await this.sendEmail(this.notifyTemplate, email.recipient, personalisation);
  }
};

module.exports.NotifyClient = NotifyClient;
