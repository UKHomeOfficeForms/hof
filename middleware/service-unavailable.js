/* eslint-disable consistent-return */
'use strict';

const getTranslations = translate => {
  const translations = {
    title: 'Sorry, this service is unavailable',
    message: 'This service is temporarily unavailable',
    'answers-saved': 'Your answers have not been saved'
  };

  if (translate) {
    // set const for checking whether a service name has been set in the journey.json file
    const isServiceNameSet = translate('journey.serviceName') !== 'journey.serviceName';

    const contact = translate('errors.service-unavailable.contact');
    const alternative = translate('errors.service-unavailable.alternative');
    translations.serviceName = isServiceNameSet ? translate('journey.serviceName') : translate('journey.header');
    translations.title = translate('errors.service-unavailable.title');
    translations.message = translate('errors.service-unavailable.message');
    translations['answers-saved'] = translate('errors.service-unavailable.answers-saved');

    // Only render contact and alternative information if the key has a value set
    if (contact === 'errors.service-unavailable.contact') {
      translations.contact = '';
    } else {
      translations.contact = translate('errors.service-unavailable.contact');
    }
    if (alternative === 'errors.service-unavailable.alternative') {
      translations.alternative = '';
    } else {
      translations.alternative = translate('errors.service-unavailable.alternative');
    }
  }
  return translations;
};

module.exports = options => {
  const opts = options || {};
  const logger = opts.logger;
  // These are paths that are allowed to bypass the "service unavailable" middleware.
  // When the service is unavailable (for example, for maintenance), all routes except those listed here
  // will return a paused response, typically a maintenance page.
  //
  // - '/assets': Static assets (CSS, JS, images) must still be served so the paused page displays correctly.
  // - '/readyz' and '/livez': Health check endpoints must remain available for Kubernetes or other orchestration
  //   systems to determine if the container is healthy, even during maintenance.
  const bypassPaths = opts.bypassPaths || ['/readyz', '/health', '/assets'];

  return (req, res, next) => {
    if (bypassPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    const translate = opts.translate || req.translate;
    const translations = getTranslations(translate);
    if (logger && logger.warn) {
      logger.warn('Service temporarily unavailable - service paused.');
    }
    res.status(503).render('service-unavailable', {
      serviceName: translations.serviceName,
      title: translations.title,
      message: translations.message,
      'answers-saved': translations['answers-saved'],
      contact: translations.contact,
      alternative: translations.alternative
    });
  };
};
