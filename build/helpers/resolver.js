const Package = require('./resolver/package');
const Import = require('./resolver/import');
const nearestPackageRoot = require('./resolver/nearest-package-root');

module.exports = function (importUrl, importOriginPath) {
  const _import = new Import(importUrl);

  return nearestPackageRoot(_import.packageName(), importOriginPath).then(function (packageRoot) {
    const _package = new Package(packageRoot);

    if (_import.isEntrypoint()) {
      return _package.fullPathToEntrypoint();
    }
    return _package.root(_import.specifiedFilePath());
  });
};
