module.exports = (app, config) => {
    const dev = Boolean(config.env === 'development');

    const nunjucks = require('nunjucks');

    const nunjucksEnv = nunjucks.configure(config.views, {
        express: app,
        dev: dev,
        noCache: dev,
        watch: dev
    });

    app.set('view engine', config.viewEngine);

    return nunjucksEnv;
}