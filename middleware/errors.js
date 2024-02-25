/* eslint-disable no-unused-vars */
'use strict';

const rateLimitsConfig = require('../config/rate-limits');

const errorTitle = code => `${code}_ERROR`;
const errorMsg = code => `There is a ${code}_ERROR`;
// eslint-disable-next-line complexity
const getContent = (err, translate) => {
  const content = {};
  
  if (err.code === 'SESSION_TIMEOUT') {
    err.status = 401;
    err.template = 'session-timeout';
    err.title = (translate && translate('errors.session.title'));
    err.message = (translate && translate('errors.session.message'));
    content.title = (translate && translate('errors.session.title'));
    content.message = (translate && translate('errors.session.message'));
  }
  
  if (err.code === 'NO_COOKIES') {
    err.status = 403;
    err.template = 'cookie-error';
    content.title = (translate && translate('errors.cookies-required.title'));
    content.message = (translate && translate('errors.cookies-required.message'));
  }
  
  if (err.code === 'DDOS_RATE_LIMIT') {
    err.status = 429;
    err.template = 'rate-limit-error';
    err.title = (translate && translate('errors.ddos-rate-limit.title'));
    err.message = (translate && translate('errors.ddos-rate-limit.message'));
    err.preTimeToWait = (translate && translate('errors.ddos-rate-limit.pre-time-to-wait'));
    err.timeToWait = rateLimitsConfig.rateLimits.requests.windowSizeInMinutes;
    err.postTimeToWait = (translate && translate('errors.ddos-rate-limit.post-time-to-wait'));
    content.title = (translate && translate('errors.ddos-rate-limit.title'));
    content.message = (translate && translate('errors.ddos-rate-limit.message'));
    content.preTimeToWait = (translate && translate('errors.ddos-rate-limit.pre-time-to-wait'));
    content.timeToWait = rateLimitsConfig.rateLimits.requests.windowSizeInMinutes;
    content.postTimeToWait = (translate && translate('errors.ddos-rate-limit.post-time-to-wait'));
  }
  
  if (err.code === 'SUBMISSION_RATE_LIMIT') {
    err.status = 429;
    err.template = 'rate-limit-error';
    err.title = (translate && translate('errors.submission-rate-limit.title'));
    err.message = (translate && translate('errors.submission-rate-limit.message'));
    err.preTimeToWait = (translate && translate('errors.submission-rate-limit.pre-time-to-wait'));
    err.timeToWait = rateLimitsConfig.rateLimits.submissions.windowSizeInMinutes;
    err.postTimeToWait = (translate && translate('errors.submission-rate-limit.post-time-to-wait'));
    content.title = (translate && translate('errors.submission-rate-limit.title'));
    content.message = (translate && translate('errors.submission-rate-limit.message'));
    content.preTimeToWait = (translate && translate('errors.submission-rate-limit.pre-time-to-wait'));
    content.timeToWait = rateLimitsConfig.rateLimits.submissions.windowSizeInMinutes;
    content.postTimeToWait = (translate && translate('errors.submission-rate-limit.post-time-to-wait'));
  }
  
  if (err.code === 'INTERNAL_SERVER_ERROR' || err.code === 'UNKNOWN') {
    err.status = err.status || 500;
    err.template = '500';
    err.title = (translate && translate('errors.500.title'));
    err.message = (translate && translate('errors.500.description'));
    err.header = (translate && translate('errors.500.header'));
    err.paragraph1 = (translate && translate('errors.500.paragraph1'));
    err.paragraph2 = (translate && translate('errors.500.paragraph2'));
    err.paragraph3 = (translate && translate('errors.500.paragraph3'));
    content.title = (translate && translate('errors.500.title'));
    content.message = (translate && translate('errors.500.description'));
    content.header = (translate && translate('errors.500.header'));
    content.paragraph1 = (translate && translate('errors.500.paragraph1'));
    content.paragraph2 = (translate && translate('errors.500.paragraph2'));
    content.paragraph3 = (translate && translate('errors.500.paragraph3'));
  }
  
  
  if (!content.title) {
    content.title = (translate && translate('errors.default.title')) || errorTitle(err.code);
  }
  if (!content.message) {
    content.message = (translate && translate('errors.default.message')) || errorMsg(err.code);
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
