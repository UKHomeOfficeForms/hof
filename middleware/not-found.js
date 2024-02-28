'use strict';

const getTranslations = translate => {
  const translations = {
    title: 'Not found',
    description: 'There is nothing here'
  };
  if (translate) {
    translations.title = translate('errors.404.title');
    translations.description = translate('errors.404.description');
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
      logger.warn(`Cannot find: ${req.url}`);
    }
    res.status(404).render('404', {
      title: translations.title,
      description: translations.description,
      // Finds the first word in the path of the
      // url and removes the leading slash.
      // Where url is `/foo/bar`, this returns `foo`.
      startLink: req.url.replace(/^\/([^\/]*).*$/, '$1')
    });
  };
};
