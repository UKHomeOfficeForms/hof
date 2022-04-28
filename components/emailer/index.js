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
    async successHandler(req, res, next) {
      req.sessionModel.unset('nodemailer-error');

      try {
        debug(`Loading email template from ${config.template}`);

        const template = await new Promise((resolve, reject) => {
          return fs.readFile(config.template, (err, resolvedTemplate) => {
            return err ? reject(err) : resolve(resolvedTemplate.toString('utf8'));
          });
        });

        debug('Rendering email content');

        const data = config.parse(req.sessionModel.toJSON(), req.translate);

        debug('Building email settings');

        const settings = { body: Hogan.compile(template).render(data) };

        if (typeof config.recipient === 'function') {
          settings.recipient = config.recipient(req.sessionModel.toJSON());
        } else {
          settings.recipient = req.sessionModel.get(config.recipient) || config.recipient;
        }
        if (typeof settings.recipient !== 'string' || !settings.recipient.includes('@')) {
          return next(new Error('hof-behaviour-emailer: invalid recipient'));
        }

        if (typeof config.subject === 'function') {
          settings.subject = config.subject(req.sessionModel.toJSON(), req.translate);
        } else {
          settings.subject = config.subject;
        }

        debug('Sending email', settings);

        await emailer.send(settings);

        debug('Email sent successfully');

        return super.successHandler(req, res, next);
      } catch (e) {
        if (config.emailerFallback) {
          req.log('error', e.message || e);
          req.sessionModel.set('nodemailer-error', true);
          return super.successHandler(req, res, next);
        }
        return next(e);
      }
    }
  };
};

module.exports.EmailService = EmailService;
