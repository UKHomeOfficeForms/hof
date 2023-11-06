'use strict';

const { remote } = require('webdriverio');
/* const options = {
  deprecationWarnings: false,
  desiredCapabilities: {
    browserName: 'chrome'
  }
}; */
let browser;
(async () => {
  browser = await remote({
    capabilities: {
      browserName: 'chrome'
    }
  });


  /* const client = webdriverio
  .remote(options); */

  browser.addCommand('goto', require('../../../utilities').autofill(client));
})().catch(e => console.error(e));
module.exports = browser;
