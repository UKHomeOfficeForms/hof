'use strict';

const { remote } = require('webdriverio');
/* const options = {
  deprecationWarnings: false,
  desiredCapabilities: {
    browserName: 'chrome'
  }
}; */

(async () => {
  const browser = await remote({
    capabilities: {
      browserName: 'chrome'
    }
  });


  /* const client = webdriverio
  .remote(options); */

  browser.addCommand('goto', require('../../../utilities').autofill(client));
  module.exports = () => browser.init();
})().catch(e => console.error(e));
