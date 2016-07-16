'use strict';

const express = require('express');
const path = require('path');

module.exports = (app, config) => {

  if (config.env === 'development' || config.env === 'docker' || config.env === 'ci') {
    app.use('/public', express.static(path.resolve(config.caller, config.assetPath)));
  }

  return app;
};
