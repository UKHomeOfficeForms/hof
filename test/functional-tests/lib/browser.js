'use strict';

/*const webdriverio = require('webdriverio');
const options = {
  deprecationWarnings: false,
  capabilities: {
    browserName: 'chrome'
  }
};

const client = webdriverio
  .remote(options);
*/
browser.addCommand('goto', require('../../../utilities').autofill(browser));

module.exports = () => browser;