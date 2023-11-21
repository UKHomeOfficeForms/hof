'use strict';
const url = require('url');

module.exports = (settings, body) => {
    return Object.assign({}, settings, {    
    'url' : settings.uri || settings.url || url.format(settings),
    'data': settings.body || body || settings.data,
    'responseType': 'arraybuffer'
  });
}