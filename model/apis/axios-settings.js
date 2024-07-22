'use strict';
const { format } = require('url'); // Destructure 'format' from 'url' module

module.exports = (settings = {}, body = null) => {
  if (typeof settings !== 'object' || settings === null) {
    throw new TypeError('settings must be a non-null object');
  }

  const {
    uri,
    url,
    body: settingsBody,
    data: settingsData,
    ...restSettings
  } = settings;

  return Object.assign({}, restSettings, {
    url: uri || url || format(settings),
    data: settingsBody || body || settingsData
  });
};
