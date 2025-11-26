'use strict';

const crypto = require('node:crypto');
const algorithm = 'aes-256-cbc';
const ivLength = 16;

/**
 * Creates an encryption utility with AES-256-CBC algorithm.
 * Provides encrypt and decrypt methods that use a random IV for each encryption operation.
 *
 * @module encryption
 * @param {string|Buffer} secret - Must be exactly 32 bytes
 * @returns {Object} Encryption utility object
 * @throws {Error} If secret is not exactly 32 bytes
 */
module.exports = secret => {
  const encryptionKey = Buffer.from(secret, 'utf8');
  if (encryptionKey.byteLength !== 32) {
    throw new Error(`Encryption secret must be exactly 32 bytes. Provided: ${encryptionKey.byteLength} bytes.`);
  }

  return {
    encrypt: text => {
      try {
        const iv = crypto.randomBytes(ivLength);
        const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
      } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
      }
    },

    decrypt: text => {
      try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
      } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
      }
    }
  };
};
