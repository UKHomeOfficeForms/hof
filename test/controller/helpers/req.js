'use strict';

module.exports = req => {
  req.form = req.form || {};
  req.form.values = req.form.values || {};
  return require('reqres').req(req);
};
