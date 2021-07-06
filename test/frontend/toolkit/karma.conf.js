module.exports = function (config) {
    config.set({
        browsers: [
            'PhantomJS'
        ],
        frameworks: ['mocha', 'chai', 'browserify'],
        preprocessors: {
            './spec/index.js': ['browserify']
        },
        files: ['./spec/index.js'],
        singleRun: true
    });
};
