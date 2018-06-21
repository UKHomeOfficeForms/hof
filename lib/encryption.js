'use strict';

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

module.exports = (password) => ({

  encrypt: (text) => {
    const cipher = crypto.createCipher(algorithm, password);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  decrypt: (text) => {
    const decipher = crypto.createDecipher(algorithm, password);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

});
