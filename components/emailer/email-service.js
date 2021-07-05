'use strict';

const fs = require('fs');
const path = require('path');
const Hogan = require('hogan.js');
const debug = require('debug')('hof:emailer');

const Emailer = require('./emailer');

module.exports = class EmailService {

  constructor(options) {
    options = options || {};
    this.layout = options.layout === undefined ? path.resolve(__dirname, './views/layout.html') : options.layout;
    this.emailer = new Emailer(options);
  }

  send(recipient, body, subject) {
    if (arguments.length === 1 && recipient.recipient) {
      body = recipient.body;
      subject = recipient.subject;
      recipient = recipient.recipient;
    }
    return this.render(recipient, body, subject)
      .then(content => {
        return this.emailer.send(recipient, subject, content);
      });
  }

  render(recipient, body, subject) {
    if (this.layout) {
      return this.template()
        .then(template => {
          return template.render({ recipient, body, subject });
        });
    }
    return Promise.resolve(body);
  }

  template() {
    debug(`Reading template file: ${this.layout}`);
    return new Promise((resolve, reject) => {
      fs.readFile(this.layout, (err, content) => {
        if (err) {
          reject(err);
        } else {
          resolve(Hogan.compile(content.toString('utf8')));
        }
      });
    });
  }

};
