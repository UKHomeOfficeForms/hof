'use strict';

const { remote } = require('webdriverio');
/* const options = {
  deprecationWarnings: false,
  desiredCapabilities: {
    browserName: 'chrome'
  }
};*/

let browser;

(async () => {
  browser = await remote({
    deprecationWarnings: false,
    capabilities: {
    browserName: 'chrome'
  }
  })

  browser.addCommand('goto', require('../../../utilities').autofill(client));
})()

module.exports = { browser };
