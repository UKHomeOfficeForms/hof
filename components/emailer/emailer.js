'use strict';

const path = require('path');
const nodemailer = require('nodemailer');
const transports = require('./transports');

const debug = require('debug')('hof:emailer');

module.exports = class Emailer {

  constructor(options) {
    options = options || {};
    this.options = options;

    options.transport = options.transport || 'smtp';
    debug(`Using ${options.transport} transport`);

    if (options.transport !== 'stub' && !options.from && !options.replyTo) {
      throw new Error('At least one of `from` or `replyTo` options must be defined');
    }

    const transport = transports[options.transport](options.transportOptions || {});

    this.emailer = nodemailer.createTransport(transport);
  }

  send(to, subject, body) {
    debug(`Sending email to ${to} with subject ${subject}`);
    return new Promise((resolve, reject) => {
      this.emailer.sendMail({
        to,
        subject,
        from: this.options.from || this.options.replyTo,
        replyTo: this.options.replyTo || this.options.from,
        html: body,
        attachments: [{
          filename: 'govuk_logotype_email.png',
          path: path.resolve(__dirname, './assets/images/govuk_logotype_email.png'),
          cid: 'govuk_logotype_email'
        },
        {
          filename: 'ho_crest_27px.png',
          path: path.resolve(__dirname, './assets/images/ho_crest_27px.png'),
          cid: 'ho_crest_27px'
        },
        {
          filename: 'spacer.gif',
          path: path.resolve(__dirname, './assets/images/spacer.gif'),
          cid: 'spacer_image'
        }]
      }, (err, result) => {
        return err ? reject(err) : resolve(result);
      });
    });
  }
};
