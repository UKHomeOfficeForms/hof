'use strict';

const path = require('path');

const pagesPath = page => path.resolve(__dirname,
  `./apps/sandbox/acceptance/pages/${page}`);

module.exports = {
  name: 'sandbox',
  include: {
    firstPage: pagesPath('first-step.js'),
    secondPage: pagesPath('second-step.js'),
    thirdPage: pagesPath('third-step.js')
  }
};
