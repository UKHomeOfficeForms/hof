'use strict';

const EmailService = require('./email-service');
const Hogan = require('hogan.js');
const fs = require('fs');
const debug = require('debug')('hof:behaviour:emailer');

module.exports = config => {
  const emailer = new EmailService(config);
  config.parse = config.parse || (data => data);

  if (!config.recipient) {
    throw new Error('hof-behaviour-emailer: email recipient must be defined');
  }
  if (typeof config.template !== 'string') {
    throw new Error('hof-behaviour-emailer: email template must be defined');
  }

  return superclass => class EmailBehaviour extends superclass {
    successHandler(req, res, callback) {
      Promise.resolve()
        .then(() => {
          debug(`Loading email template from ${config.template}`);
          return new Promise((resolve, reject) => {
            fs.readFile(config.template, (err, template) => err ? reject(err) : resolve(template.toString('utf8')));
          });
        })
        .then(template => {
          debug('Rendering email content');
          const data = config.parse(req.sessionModel.toJSON(), req.translate);
          return Hogan.compile(template).render(data);
        })
        .then(body => {
          debug('Building email settings');
          const settings = { body };

          if (typeof config.recipient === 'function') {
            settings.recipient = config.recipient(req.sessionModel.toJSON());
          } else {
            settings.recipient = req.sessionModel.get(config.recipient) || config.recipient;
          }
          if (typeof settings.recipient !== 'string' || !settings.recipient.includes('@')) {
            throw new Error('hof-behaviour-emailer: invalid recipient');
          }

          if (typeof config.subject === 'function') {
            settings.subject = config.subject(req.sessionModel.toJSON(), req.translate);
          } else {
            settings.subject = config.subject;
          }

          return settings;
        })
        .then(settings => {
          debug('Sending email', settings);
          return emailer.send(settings);
        })
        .then(() => {
          debug('Email sent successfully');
          super.successHandler(req, res, callback);
        }, callback);
    }
  };
};

module.exports.EmailService = EmailService;
