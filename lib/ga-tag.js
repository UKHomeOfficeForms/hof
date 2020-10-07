'use strict';

const _ = require('lodash');

let pageView = (path, pageMap) => {
  return pageMap.get(path) || path;
};

let createUris = routes => {
  let uris = _.map(routes, subApp => {
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

let createIdentifiers = routes => {
  return _.map(routes, route => {
    const routeIdentifier = route
      .replace(/^[^A-Z0-9]+/gi, '')
      .toLowerCase()
      .replace(/([^A-Z0-9]+)(.)/ig, function upperCaseMatches() {
        return arguments[2].toUpperCase();
      });

    return [route, routeIdentifier];
  });
};

let setupPageMap = routes => {
  var mappedRoutes = createUris(routes);
  mappedRoutes = createIdentifiers(mappedRoutes);

  const pageMap = new Map(mappedRoutes);

  return pageMap;
};

module.exports = (app, config) => {
  const gaTagId = config.gaTagId;
  let routes = config.routes;

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
