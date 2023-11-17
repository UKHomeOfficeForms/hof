'use strict';

const Model = require('..');
const isPdf = require('is-pdf');
const config = require('../../config/hof-defaults');

module.exports = class PDFModel extends Model {
  requestConfig(options) {
    const settings = super.requestConfig(options);
    settings.encoding = null;
    settings.rejectUnauthorized = false;
    settings.responseType = 'arraybuffer';
    console.log("settings---------------: ", settings);
    return settings;
  }

  url() {
    return config.apis.pdfConverter;
  }

  handleResponse(response, callback) {
    if (isPdf(Buffer.from(response.data))) {
      return this.parseResponse(response.status, response.data, callback);
    }
    const err = new Error();

    if (parseInt(response.status, 10) === 400) {
      err.title = response.status;
      err.message = response.statusText;
    } else {
      err.body = response.data;
    }
    err.status = response.status;
    return callback(err, null, response.status);
  }
};
