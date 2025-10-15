'use strict';
const toolkitImages =
  process.env.HOF_SANDBOX === 'true'
    ? '../frontend/toolkit/assets/rebrand/images'
    : 'node_modules/hof/frontend/toolkit/assets/rebrand/images';

module.exports = {
  browserify: {
    src: 'assets/rebrand/js/index.js',
    out: 'public/js/bundle.js',
    match: 'assets/rebrand/js/**/*.js',
    restart: false,
    compress: false,
    debug: false
  },
  sass: {
    src: 'assets/rebrand/scss/app.scss',
    out: 'public/css/app.css',
    match: 'assets/rebrand/scss/**/*.scss',
    restart: false,
    quietDeps: false,
    outputStyle: 'expanded',
    sourceMaps: false
  },
  translate: {
    src: 'apps/**/translations/src',
    match: 'apps/**/translations/src/**/*.json',
    shared: 'apps/common/translations/src'
  },
   images: {
    src: ['assets/rebrand/images', toolkitImages],
    out: 'public',
    match: ['assets/rebrand/images/**/*', `${toolkitImages}/**/*`],
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
