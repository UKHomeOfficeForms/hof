'use strict';

const _ = require('lodash');

const pageView = (path, pageMap) => pageMap.get(path) || path;

const createUris = routes => {
  const uris = _.map(routes, subApp => {
    let subAppUris = Object.keys(subApp.steps);
    const subAppBaseUrl = subApp.baseUrl;

    if (subAppBaseUrl) {
      subAppUris = _.map(subAppUris, uri => `${subAppBaseUrl}${uri}`);
      subAppUris.unshift(subAppBaseUrl);
    }
    return subAppUris;
  });

  return _.flatten(uris);
};

const createIdentifiers = routes => _.map(routes, route => {
  const routeIdentifier = route
    .replace(/^[^A-Z0-9]+/gi, '')
    .toLowerCase()
    .replace(/([^A-Z0-9]+)(.)/ig, function () {
      return arguments[2].toUpperCase();
    });

  return [route, routeIdentifier];
});

const setupPageMap = routes => {
  let mappedRoutes = createUris(routes);
  mappedRoutes = createIdentifiers(mappedRoutes);

  const pageMap = new Map(mappedRoutes);

  return pageMap;
};

module.exports = (app, config) => {
  const gaTagId = config.gaTagId;
  const routes = config.routes;

  if (gaTagId) {
    const pageMap = setupPageMap(routes);

    app.use((req, res, next) => {
      res.locals.gaTagId = gaTagId;
      res.locals['ga-id'] = gaTagId;
      res.locals['ga-page'] = pageView(req.path, pageMap);
      next();
    });
  }

  return app;
};
