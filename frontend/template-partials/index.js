'use strict';

const path = require('path');

module.exports = {
  views: path.resolve(__dirname, './views'),
  translations: path.resolve(__dirname, './translations/__lng__/__ns__.json'),
  resources: require('./translations')
};
