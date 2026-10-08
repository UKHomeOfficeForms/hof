const path = require('path');

const importSeparator = /[\\/]/;

function Import(importUrl) {
  this.importUrl = importUrl;
  this.segments = importUrl.split(importSeparator);
}

Import.prototype.isScoped = function () {
  return this.importUrl[0] === '@';
};

Import.prototype.packageName = function () {
  const packageSegmentCount = this.isScoped() ? 2 : 1;
  return this.segments.slice(0, packageSegmentCount).join('/');
};

Import.prototype.isEntrypoint = function () {
  const packageSegmentCount = this.isScoped() ? 2 : 1;
  return this.segments.length === packageSegmentCount;
};

Import.prototype.specifiedFilePath = function () {
  const packageSegmentCount = this.isScoped() ? 2 : 1;
  return path.join(...this.segments.slice(packageSegmentCount));
};

module.exports = Import;
