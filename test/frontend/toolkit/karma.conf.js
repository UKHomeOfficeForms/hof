module.exports = function (config) {
  config.set({
    browsers: [
      'PhantomJS'
    ],
    frameworks: ['mocha', 'chai', 'vite'],
    preprocessors: {
      './spec/index.js': ['vite']
    },
    files: ['./spec/index.js'],
    singleRun: true
  });
};
