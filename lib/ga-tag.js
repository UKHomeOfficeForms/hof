'use strict';

const _ = require('lodash');

const convertToGTMPage = (text) => {
  // Remove leading and trailing slashes
  let str = text.replace(/^\/|\/$/g, '');
  // Replace hyphens with spaces and capitalize each word
  str = str.replace(/-+/g, ' ').replace(/(^|\s)\S/g, function(match) {
    return match.toUpperCase();
  });
  return str;
}

const pageView = (path, pageMap) => pageMap.get(path) || path;

const createUris = routes => {
  const uris = _.map(routes, subApp => {
    let subAppUris = Object.keys(subApp.steps || {});
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
  const ga4TagId = config.ga4TagId;
  const gtmTagId = config.gtmTagId;
  const appName = config.appName;
  const gaCrossDomainTrackingTagId = config.gaCrossDomainTrackingTagId;
  const routes = config.routes;

  if (gaTagId || ga4TagId) {
    const pageMap = setupPageMap(routes);

    app.use((req, res, next) => {
      const page = pageView(req.path, pageMap);
      res.locals.gaAllowDebug = config.env === 'development';
      res.locals.gaTagId = gaTagId;
      res.locals.ga4TagId = ga4TagId;
      res.locals.gtmTagId = gtmTagId
      res.locals.appName = appName
      res.locals.gaCrossDomainTrackingTagId = gaCrossDomainTrackingTagId;
      res.locals['ga-id'] = gaTagId;
      res.locals['ga-page'] = page
      res.locals['gtm-page'] = convertToGTMPage(page)
      next();
    });
  }

  return app;
};
