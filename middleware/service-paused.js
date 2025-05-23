'use strict';

const getTranslations = translate => {
  const translations = {
    title: 'Sorry, this service is unavailable',
    message: 'This service is temporarily unavailable',
    'answers-saved': 'Your answers have not been saved'
  };

  if (translate) {
    const contact = translate('errors.service-paused.contact');
    const alternative = translate('errors.service-paused.alternative');
    translations.serviceName = translate('journey.serviceName') || translate('journey.header');
    translations.title = translate('errors.service-paused.title');
    translations.message = translate('errors.service-paused.message');
    translations['answers-saved'] = translate('errors.service-paused.answers-saved');

    // Only render contact and alternative information if the key has a value set
    if (contact === 'errors.service-paused.contact') {
      translations.contact = '';
    } else {
      translations.contact = translate('errors.service-paused.contact');
    }
    if (alternative === 'errors.service-paused.alternative') {
      translations.alternative = '';
    } else {
      translations.alternative = translate('errors.service-paused.alternative');
    }
  }
  return translations;
};

module.exports = options => {
  const opts = options || {};
  const logger = opts.logger;

  return (req, res) => {
    const translate = opts.translate || req.translate;
    const translations = getTranslations(translate);
    if (logger && logger.warn) {
      logger.warn('Service temporarily unavailable - service paused.');
    }
    res.status(503).render('service-paused', {
      serviceName: translations.serviceName,
      title: translations.title,
      message: translations.message,
      'answers-saved': translations['answers-saved'],
      contact: translations.contact,
      alternative: translations.alternative
    });
  };
};
