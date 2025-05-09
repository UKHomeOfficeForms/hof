const fs = require('fs');

const dirExists = dir => {
  try {
    if (fs.existsSync(dir)) {
      return true;
    }
    return false;
  } catch (err) {
    throw new Error(`${err}: Cannot check if the directory path exists`);
  }
};

const filterEmptyViews = views => {
  return views.filter(view => dirExists(view));
};

module.exports = (app, config) => {
  const dev = Boolean(config.env === 'development');

  const nunjucks = require('nunjucks');

  const filteredViews = filterEmptyViews(config.theme.views);
  const viewPaths = ['../frontend/components', '../frontend/views'].concat(filteredViews);

  if (config.views) {
    const viewsArray = _.castArray(config.views);
    viewsArray.slice().reverse().forEach(view => {
      const customViewPath = path.resolve(config.root, view);
      try {
        fs.accessSync(customViewPath, fs.F_OK);
      } catch (err) {
        throw new Error(`Cannot find views at ${customViewPath}`);
      }
      viewPaths.unshift(customViewPath);
    });
  }

  const nunjucksEnv = nunjucks.configure(viewPaths, {
    express: app,
    dev: dev,
    noCache: dev,
    watch: dev
  });

  app.set('view engine', config.viewEngine);

  return nunjucksEnv;
}
