'use strict';

const express = require('express');

module.exports = (app, config) => {

  if (config.env === 'development' || config.env === 'docker' || config.env === 'ci') {
    app.use('/public', express.static(config.assets));
  }

  return app;
};
