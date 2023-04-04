/* eslint-disable max-len, no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const mimes = {
  '.gif': 'image/gif',
  '.png': 'image/png'
};

const mkdir = dir => new Promise((resolve, reject) => {
  fs.mkdir(dir, {recursive: true}, err => err ? reject(err) : resolve());
});

const cidToBase64 = (h, attachments) => {
  let html = h;
  const list = attachments.reduce((p, attachment) => {
    const mimeType = mimes[path.extname(attachment.path)];
    return p
      .then(map => new Promise((resolve, reject) => fs.readFile(attachment.path, (err, buffer) => err ? reject(err) : resolve(buffer.toString('base64'))))
        .then(data => {
          map[attachment.cid] = `"data:${mimeType};base64,${data}"`;
          return map;
        }));
  }, Promise.resolve({}));

  return list.then(files => {
    Object.keys(files).forEach(cid => {
      html = html.replace(`"cid:${cid}"`, files[cid]);
    });
    return html;
  });
};

module.exports = options => {
  options.log = options.log !== false;
  return {
    name: 'debug',
    version: '1.0.0',
    send: (mail, callback) => {
      mail.resolveContent(mail.data, 'html', (err, html) => {
        if (err) {
          return callback(err);
        }
        const dir = options.dir || path.join(process.cwd(), '.emails');
        const messageId = options.filename || mail.message.messageId().split('@')[0].slice(1);
        const outfile = path.resolve(dir, `${messageId}.html`);

        return mkdir(dir)
          .then(() => cidToBase64(html, mail.data.attachments))
          .then(inlined => new Promise((resolve, reject) => {
            fs.writeFile(outfile, inlined, e => e ? reject(e) : resolve(inlined));
          }))
          .then(() => {
            if (options.log) {
              console.log('Email sent:');
              console.log(`  to:      ${mail.data.to}`);
              console.log(`  subject: ${mail.data.subject}`);
              console.log(`  html:    ${outfile}`);
            }
          })
          .then(() => {
            if (options.open) {
              cp.execSync(`open ${outfile}`);
            }
            callback();
          })
          .catch(callback);
      });
    }
  };
};
