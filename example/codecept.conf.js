'use strict';

const path = require('path');

const pagesPath = page => path.resolve(__dirname,
  `./apps/example-app/acceptance/pages/${page}`);

module.exports = {
  name: 'example-app',
  include: {
    firstPage: pagesPath('first-step.js'),
    secondPage: pagesPath('second-step.js'),
    thirdPage: pagesPath('third-step.js')
  }
};
