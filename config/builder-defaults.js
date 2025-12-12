'use strict';
const toolkitImages =
  process.env.HOF_SANDBOX === 'true'
    ? '../frontend/toolkit/assets/rebrand/images'
    : 'node_modules/hof/frontend/toolkit/assets/rebrand/images';

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
  translate: {
    src: 'apps/**/translations/src',
    match: 'apps/**/translations/src/**/*.json',
    shared: 'apps/common/translations/src'
  },
  images: {
    src: ['assets/rebrand/images', 'assets/images', toolkitImages],
    out: 'public/images',
    match: 'assets/images/**/*',
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
