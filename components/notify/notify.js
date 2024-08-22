'use strict';

const NotifyClient = require('notifications-node-client').NotifyClient;
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/hof-defaults');
const logger = require('../../lib/logger');

module.exports = class Notify {
  constructor(opts) {
    const options = opts || {};
    this.options = options;
    this.logger = logger(config);
    this.notifyClient =  new NotifyClient(options.notifyApiKey);
    this.notifyTemplate = options.notifyTemplate;
  }

  async sendEmail(templateId, recipient, personalisation) {
    const reference = uuidv4();

    try {
      await this.notifyClient.sendEmail(templateId, recipient, {
        personalisation: personalisation,
        reference });
      this.logger.log('info', 'Email sent');
    } catch (error) {
      this.logger.log('error', error.response ? error.response.data : error.message);
      throw new Error(error.response ? error.response.data : error.message);
    }
  }

  async send(email) {
    let personalisation = {
      'email-subject': email.subject,
      'email-body': email.body
    };

    if (email.attachment && email.attachment !== undefined) {
      personalisation = Object.assign({'email-attachment':
        this.notifyClient.prepareUpload(email.attachment)}, personalisation);
    }

    try {
      await this.sendEmail(this.notifyTemplate, email.recipient, personalisation);
    } catch (error) {
      this.logger.log('error', error.response ? error.response.data : error.message);
      throw new Error(error.response ? error.response.data : error.message);
    }
  }
};

module.exports.NotifyClient = NotifyClient;
