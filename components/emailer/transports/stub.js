'use strict';

const stub = require('nodemailer-stub-transport');

module.exports = () => {
  return stub();
};
