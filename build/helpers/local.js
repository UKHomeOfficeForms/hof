const path = require('path');
const glob = require('glob');

module.exports = function (url, file, done) {
  // if url starts with . or / then assume it's a local/relative path
  if (['.', path.sep].indexOf(url.substr(0, 1)) > -1) {
    return done(null, true);
  }

  // otherwise construct a glob to match possible relative file paths
  const basedir = path.dirname(file);

  const bits = url.split(path.sep);

  let filename = bits.pop();
  const filepath = bits.join(path.sep);

  // support _ prefixing of filenames
  if (filename[0] !== '_') {
    filename = '?(_)' + filename;
  }

  // match .scss, .sass or .css if the extension is not defined
  if (filename.indexOf('.') === -1) {
    filename += '.@(sa|c|sc)ss';
  }

  const target = path.join(basedir, filepath, filename);

  // test the constructed glob against the file system for possible matches
  glob(target, function (err, list) {
    done(err, list.length);
  });
  return null;
};
