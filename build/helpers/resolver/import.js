const path = require('path');

function Import(importUrl) {
  this.importUrl = importUrl;
}

Import.prototype.isScoped = function () {
  return this.importUrl[0] === '@';
};

Import.prototype.packageName = function () {
  if (this.isScoped()) {
    return this.importUrl.split(path.sep, 2).join(path.sep);
  }
  return this.importUrl.split(path.sep, 1)[0];
};

Import.prototype.isEntrypoint = function () {
  const safePathSplitPattern = new RegExp(path.sep + '.');
  const pathSegmentCount = this.importUrl.split(safePathSplitPattern).length;

  if (this.isScoped()) {
    return pathSegmentCount === 2;
  }
  return pathSegmentCount === 1;
};

Import.prototype.specifiedFilePath = function () {
  return this.importUrl.slice(this.packageName().length);
};

module.exports = Import;
