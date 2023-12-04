'use strict';

module.exports = {
  browserify: {
    src: 'assets/js/index.js',
    out: 'public/js/bundle.js',
    match: 'assets/js/**/*.js',
    restart: false,
    compress: false
  },
  sass: {
    src: 'assets/scss/app.scss',
    out: 'public/css/app.css',
    match: 'assets/scss/**/*.scss',
    restart: false,
    quietDeps: false,
    outputStyle: 'expanded'
  },
  translate: {
    src: 'apps/**/translations/src',
    match: 'apps/**/translations/src/**/*.json',
    shared: 'apps/common/translations/src'
  },
  images: {
    src: 'assets/images',
    out: 'public',
    match: 'assets/images/**/*',
    restart: false
  },
  fonts: {
    src: 'assets/fonts',
    out: 'public',
    match: 'assets/fonts/**/*',
    restart: false
  },
  server: {
    cmd: 'npm start',
    extensions: ['.js', '.json', '.html', '.md']
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
