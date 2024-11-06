/* eslint-disable */
'use strict';

const crypto = require('node:crypto');
const algorithm = 'aes-256-cbc';
const ivLength = 16;
const keyLength = 32;

/**
 * Generates an encryption key from a source string or Buffer suitable for use with Node.js
 * Crypto package createCipheriv and createDecipheriv methods.
 *
 * @param {string|Buffer} source - A source to generate a repeatable key from.
 * @param {number} lengthBytes - The length in bytes that the generated key should have.
 * @returns {Buffer} - An encrytion key in Buffer format of length: lengthBytes
 */
const generateEncryptionKey = (source, lengthBytes) => {
  return Buffer.concat([Buffer.from(source), Buffer.alloc(lengthBytes)], lengthBytes);
}

module.exports = (keySource) => ({
  encrypt: text => {
    let iv = crypto.randomBytes(ivLength);
    let cipher = crypto.createCipheriv(
      algorithm,
      generateEncryptionKey(keySource, keyLength),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  },

  decrypt: text => {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(
      algorithm,
      generateEncryptionKey(keySource, keyLength),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }
});
