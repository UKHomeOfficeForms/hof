const path = require('path');

function Package(rootPath) {
  this.root = path.join.bind(null, rootPath);
  this.JSON = require(this.root('package.json'));
}

Package.prototype.fullPathToEntrypoint = function () {
  return this.root(this.entrypoint());
};

Package.prototype.entrypoint = function () {
  if (this.JSON.sass) {
    return this.JSON.sass;
    // look for "style" declaration in package.json
  } else if (this.JSON.style) {
    return this.JSON.style;
    // look for "styles" declaration in package.json
  } else if (this.JSON.styles) {
    return this.JSON.styles;
    // look for a css/sass/scss file in the "main" declaration in package.json
  } else if (/\.(sa|c|sc)ss$/.test(this.JSON.main)) {
    return this.JSON.main;
    // otherwise assume ./styles.scss
  }
  return 'styles';
};

module.exports = Package;
