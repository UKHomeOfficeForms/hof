'use strict';

module.exports = {
  sass: {
    src: 'assets/scss/app.scss',
    out: 'public/css/app.css',
    match: 'assets/scss/**/*.scss',
    restart: false,
    quietDeps: false,
    outputStyle: 'expanded',
    sourceMaps: false
  },
  js: {
    sourceMaps: false
  },
  translate: {
    src: 'apps/**/translations/src',
    match: 'apps/**/translations/src/**/*.json',
    shared: 'apps/common/translations/src'
  },
  images: {
    src: ['assets/rebrand/images', 'assets/images'],
    out: 'public/images',
    match: 'assets/images/**/*',
    restart: false
  },
  server: {
    cmd: 'npm start',
    extensions: ['.js', '.json', '.html', '.njk', '.md']
  },
  watch: {
    restart: 'rs',
    ignore: [
      '*.log',
      '.git',
      'coverage',
      'public'
    ]
  }
};
