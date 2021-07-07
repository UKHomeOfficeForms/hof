'use strict';

const _ = require('lodash');

const Translator = (translate, req) => function deepTranslate(key) {
  let translated = translate(key);
  if (_.isPlainObject(translated)) {
    translated = _.reduceRight(translated, (prev, item, tKey) => {
      let translationPath = key + '.' + tKey;
      if (_.isPlainObject(item) && req.sessionModel) {
        let value = req.sessionModel.get(tKey);
        if (value) {
          value = value.toString();
        }
        translationPath += '.' + value;
      }
      const result = deepTranslate(translationPath);
      return result !== translationPath ? result : prev;
    }, '');
  }
  return translated;
};

module.exports = opts => {
  const options = opts || {};
  return (req, res, next) => {
    const translate = options.translate || req.translate || (a => a);
    req.translate = Translator(translate, req);
    req.rawTranslate = translate;
    next();
  };
};
