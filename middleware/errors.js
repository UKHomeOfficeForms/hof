/* eslint-disable no-unused-vars */
'use strict';

const rateLimitsConfig = require('../config/rate-limits');

const errorTitle = code => `${code}_ERROR`;
const errorMsg = code => `There is a ${code}_ERROR`;

// eslint-disable-next-line complexity
const getContent = (err, translate) => {
  const content = {};

  // Helper to safely call translate if it's a function
  const t = key => (typeof translate === 'function' ? translate(key) : undefined);

  // Check whether a service name has been set in the journey.json file
  const getServiceName = () => {
    const serviceName = t('journey.serviceName');
    const header = t('journey.header');

    // Return serviceName if it's translated, otherwise fallback to journey header
    return serviceName && serviceName !== 'journey.serviceName' ? serviceName : header;
  };

  const serviceName = getServiceName();

  if (err.code === 'SESSION_TIMEOUT') {
    err.status = 401;
    err.template = 'session-timeout';
    err.serviceName = serviceName;
    err.title = t('errors.session.title');
    err.message = t('errors.session.message');
    content.serviceName = serviceName;
    content.title = t('errors.session.title');
    content.message = t('errors.session.message');
  }

  if (err.code === 'NO_COOKIES') {
    err.status = 403;
    err.template = 'cookie-error';
    content.serviceName = serviceName;
    content.title = t('errors.cookies-required.title');
    content.message = t('errors.cookies-required.message');
  }

  if (err.code === 'DDOS_RATE_LIMIT') {
    err.status = 429;
    err.template = 'rate-limit-error';
    err.serviceName = serviceName;
    err.title = t('errors.ddos-rate-limit.title');
    err.message = t('errors.ddos-rate-limit.message');
    err.preTimeToWait = t('errors.ddos-rate-limit.pre-time-to-wait');
    err.timeToWait = rateLimitsConfig.rateLimits.requests.windowSizeInMinutes;
    err.postTimeToWait = t('errors.ddos-rate-limit.post-time-to-wait');
    content.title = t('errors.ddos-rate-limit.title');
    content.serviceName = serviceName;
    content.message = t('errors.ddos-rate-limit.message');
    content.preTimeToWait = t('errors.ddos-rate-limit.pre-time-to-wait');
    content.timeToWait = rateLimitsConfig.rateLimits.requests.windowSizeInMinutes;
    content.postTimeToWait = t('errors.ddos-rate-limit.post-time-to-wait');
  }

  if (err.code === 'SUBMISSION_RATE_LIMIT') {
    err.status = 429;
    err.template = 'rate-limit-error';
    err.serviceName = serviceName;
    err.title = t('errors.submission-rate-limit.title');
    err.message = t('errors.submission-rate-limit.message');
    err.preTimeToWait = t('errors.submission-rate-limit.pre-time-to-wait');
    err.timeToWait = rateLimitsConfig.rateLimits.submissions.windowSizeInMinutes;
    err.postTimeToWait = t('errors.submission-rate-limit.post-time-to-wait');
    content.serviceName = serviceName;
    content.title = t('errors.submission-rate-limit.title');
    content.message = t('errors.submission-rate-limit.message');
    content.preTimeToWait = t('errors.submission-rate-limit.pre-time-to-wait');
    content.timeToWait = rateLimitsConfig.rateLimits.submissions.windowSizeInMinutes;
    content.postTimeToWait = t('errors.submission-rate-limit.post-time-to-wait');
  }

  err.code = err.code || 'UNKNOWN';
  err.status = err.status || 500;

  if (!content.title) {
    content.title = t('errors.default.title') || errorTitle(err.code);
  }
  if (!content.message) {
    content.message = t('errors.default.message') || errorMsg(err.code);
  }
  return content;
};

const returnBaseUrl = url => {
  const splitUrl = url.split('/');
  if (splitUrl.length > 2) {
    return `/${splitUrl[1]}`;
  }
  return '/';
};

module.exports = options => {
  const opts = options || {};
  const logger = opts.logger;
  const debug = opts.debug;

  return (err, req, res, next) => {
    const translate = opts.translate || req.translate;
    const content = getContent(err, translate);
    const locals = {
      error: err,
      serviceName: content.serviceName,
      content: debug === true ? err : content,
      showStack: debug === true,
      startLink: returnBaseUrl(req.path),
      baseUrl: returnBaseUrl(req.path)
    };

    if (logger && logger.error) {
      logger.error(err.message || err.error, err);
    }

    res.status(err.status);
    res.render(err.template || 'error', locals, (e, html) => {
      if (e) {
        res.render('error', locals);
      } else {
        res.send(html);
      }
    });
  };
};
