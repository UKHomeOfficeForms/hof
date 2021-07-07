const local = require('./local');
const resolve = require('./resolver');

module.exports = function (options) {
  const importerOptions = options || {};

  function importer(url, file, done) {
    let importerUrl = url;
    if (importerOptions.aliases && importerOptions.aliases[importerUrl]) {
      importerUrl = importerOptions.aliases[importerUrl];
    }

    local(importerUrl, file, function (err, isLocal) {
      if (err || isLocal) {
        done({ file: importerUrl });
      } else {
        resolve(importerUrl, file)
          .catch(function () { return importerUrl; })
          .then(function (path) {
            const importerPath = path.replace(/\.css$/, '');
            return { file: importerPath };
          })
          .then(done);
      }
    });
  }

  return importer;
};
