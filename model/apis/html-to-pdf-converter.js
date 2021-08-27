'use strict';

const Model = require('..');
const isPdf = require('../../');
const config = require('../../config/hof-defaults');

module.exports = class PDFModel extends Model {
  requestConfig(options) {
    const settings = super.requestConfig(options);
    settings.encoding = null;
    settings.rejectUnauthorized = false;
    return settings;
  }

  url() {
    return config.apis.pdfConverter;
  }

  handleResponse(response, callback) {
    if (isPdf(Buffer.from(response.body))) {
      return this.parseResponse(response.statusCode, response.body, callback);
    }
    const err = new Error();
    if (parseInt(response.statusCode, 10) === 400) {
      err.title = response.body.code;
      err.message = response.body.message;
    } else {
      err.body = response.body;
    }
    err.status = response.statusCode;
    return callback(err, null, response.statusCode);
  }
};
