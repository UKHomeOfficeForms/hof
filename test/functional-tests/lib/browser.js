'use strict';

const webdriverio = require('webdriverio');
const options = {
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

const client = webdriverio
  .remote(options);

client.addCommand('goto', require('hof-util-autofill')(client));

module.exports = () => client.init();
