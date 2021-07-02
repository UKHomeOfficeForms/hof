const path = require('path');
const findup = require('findup');

/**
 * @param {string} importOriginPath Path of file that made @import reference
 */
module.exports = function (packageName, importOriginPath) {
  const pathToFind = path.join('node_modules', packageName, 'package.json');
  const dirnameOfImportOrigin = path.dirname(importOriginPath);
  let handleFoundPath;

  const promise = new Promise(function (resolve, reject) {
    handleFoundPath = function (err, nearestPackageParent) {
      if (err) {
        try {
          return resolve(path.dirname(require.resolve(`${packageName}/package.json`)));
        } catch (e) {
          console.log(e);
        }
        return reject(err);
      }

      const packageJSONLocation = path.join(nearestPackageParent, 'node_modules', packageName);

      return resolve(packageJSONLocation);
    };
  });

  findup(dirnameOfImportOrigin, pathToFind, handleFoundPath);

  return promise;
};
