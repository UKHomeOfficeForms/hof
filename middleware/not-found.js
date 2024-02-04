'use strict';

const getTranslations = translate => {
  const translations = {
    title: 'Not found',
    description: 'There is nothing here',
    paragraph1: '',
    paragraph2: '',
    paragraph3: '',
    paragraph3sub: '',
    referencetag: ''
  };
  if (translate) {
    translations.title = translate('errors.404.title');
    translations.description = translate('errors.404.description');
    translations.paragraph1 = translate('errors.404.paragraph1');
    translations.paragraph2 = translate('errors.404.paragraph2');
    translations.paragraph3 = translate('errors.404.paragraph3');
    translations.paragraph3sub = translate('errors.404.paragraph3sub');
    translations.referencetag = translate('errors.404.referencetag');
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
      paragraph1: translations.paragraph1,
      paragraph2: translations.paragraph2,
      paragraph3: translations.paragraph3,
      paragraph3sub: translations.paragraph3sub,
      referencetag: translations.referencetag,
      // Finds the first word in the path of the
      // url and removes the leading slash.
      // Where url is `/foo/bar`, this returns `foo`.
      startLink: req.url.replace(/^\/([^\/]*).*$/, '$1')
    });
  };
};
