'use strict';

const express = require('express');
const path = require('path');

module.exports = (app, config) => {

  if (config.env !== 'production') {
    app.use('/public', express.static(path.resolve(config.root, 'public')));
  }

  return app;
};
