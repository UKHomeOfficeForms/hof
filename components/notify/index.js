'use strict';

const Notify = require('./notify');
const Hogan = require('hogan.js');
const fs = require('fs');

module.exports = config => {
  const notify = new Notify(config);
  config.parse = config.parse || (data => data);

  if (!config.recipient) {
    throw new Error('Email recipient must be defined');
  }
  if (typeof config.template !== 'string') {
    throw new Error('Email template must be defined');
  }

  return superclass => class NotifyBehaviour extends superclass {
    successHandler(req, res, next) {
      Promise.resolve()
        .then(() => {
          return new Promise((resolve, reject) => {
            fs.readFile(config.template, (err, template) => err ? reject(err) : resolve(template.toString('utf8')));
          });
        })
        .then(template => {
          const data = config.parse(req.sessionModel.toJSON(), req.translate);
          return Hogan.compile(template).render(data);
        })
        .then(body => {
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
          if (config.attachment && config.attachment !== undefined) {
            settings.attachment = config.attachment(req.sessionModel.toJSON(), req.translate);
          }

          return settings;
        })
        .then(settings => {
          return notify.send(settings);
        })
        .then(() => {
          super.successHandler(req, res, next);
        }, next);
    }
  };
};

module.exports.Notify = Notify;
