'use strict';

const _ = require('lodash');

const convertToGTMPage = text => {
  // Remove leading and trailing slashes
  let str = text.replace(/^\/|\/$/g, '');
  // Replace hyphens with spaces and capitalize each word
  str = str.replace(/-+/g, ' ').replace(/(^|\s)\S/g, function (match) {
    return match.toUpperCase();
  });
  return str;
};

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
  const gtm = config.gtm;
  const gaCrossDomainTrackingTagId = config.gaCrossDomainTrackingTagId;
  const routes = config.routes;

  if (gaTagId || ga4TagId || gtm.tagId) {
    const pageMap = setupPageMap(routes);

    app.use((req, res, next) => {
      const page = pageView(req.path, pageMap);

      // Preparing common res.locals properties
      const properties = {
        gaAllowDebug: config.env === 'development',
        gaTagId: gaTagId,
        ga4TagId: ga4TagId,
        gaCrossDomainTrackingTagId: gaCrossDomainTrackingTagId,
        'ga-id': gaTagId,
        'ga-page': page
      };

      // Adding extra properties if a GTM TAG is available
      if (gtm.tagId) {
        gtm.config.pageName = gtm.composePageName(page, convertToGTMPage);
        Object.assign(properties, {
          gtmConfig: JSON.stringify(gtm.config),
          gtmTagId: gtm.tagId
        });
      }
      res.locals = Object.assign(res.locals, properties);
      next();
    });
  }

  return app;
};
