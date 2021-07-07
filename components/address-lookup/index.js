/* eslint-disable func-names */
'use strict';

const path = require('path');
const querystring = require('querystring');
const _ = require('lodash');

const DefaultModel = require('./default-model');
const defaults = require('./defaults');

const conditionalTranslate = (key, t) => {
  let result = t(key);
  if (result === key) {
    result = null;
  }
  return result;
};

const getFields = (key, t, requiredValidate) => ({

  [`${key}-postcode`]: {
    label: conditionalTranslate(`fields.${key}-postcode.label`, t) || defaults.POSTCODE_LABEL,
    mixin: 'input-text-code',
    validate: requiredValidate ? ['required', 'postcode'] : ['postcode'],
    formatter: 'uppercase'
  },
  [`${key}-select`]: {
    label: conditionalTranslate(`fields.${key}-select.label`, t) || defaults.SELECT_LABEL,
    mixin: 'select',
    validate: [function required(val) {
      return val !== '-1';
    }]
  },
  [key]: {
    label: conditionalTranslate(`fields.${key}.label`, t) || defaults.ADDRESS_LABEL,
    mixin: 'textarea',
    validate: 'required',
    'ignore-defaults': true,
    formatter: ['trim', 'hyphens'],
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  }
});

const getConfig = key => ({
  postcode: {
    fields: [`${key}-postcode`],
    template: 'postcode'
  },
  lookup: {
    fields: [`${key}-select`],
    template: 'address-lookup'
  },
  address: {
    fields: [key],
    template: 'address'
  },
  manual: {
    fields: [key],
    template: 'address'
  }
});

module.exports = config => {
  const addressKey = config.addressKey;
  const required = config.required;
  if (!addressKey) {
    throw new Error('addressKey must be provided');
  }

  const Model = config.Model || DefaultModel;
  const apiSettings = config.apiSettings || {};
  const validate = config.validate;

  return superclass => class extends superclass {
    configure(req, res, callback) {
      this.model = new Model(_.merge({}, apiSettings, { validate }));
      req.query.step = req.query.step || 'postcode';
      const subSteps = getConfig(addressKey);
      const step = subSteps[req.query.step];
      _.merge(req.form.options, {
        subSteps,
        addressKey,
        fields: _.pick(getFields(addressKey, req.translate, required), step.fields),
        apiError: null
      });
      if (step.template) {
        req.form.options.template = path.resolve(__dirname, `./templates/${step.template}.html`);
      }
      super.configure(req, res, callback);
    }

    getNextStep(req, res, callback) {
      const step = super.getNextStep(req, res, callback);

      if (req.query.step === 'postcode' && req.form.values[`${addressKey}-postcode`]) {
        const nextSubStep = req.sessionModel.get(`${addressKey}-addresses`) ? 'lookup' : 'address';
        const qs = querystring.stringify(_.merge({}, req.query, {
          step: nextSubStep
        }));
        return `?${qs}`;
      }
      return step;
    }

    getValues(req, res, callback) {
      if (req.query.step === 'manual') {
        req.sessionModel.unset([
          `${addressKey}-postcodeApiMeta`
        ]);
      } else if (req.query.step === 'lookup') {
        const addresses = req.sessionModel.get(`${addressKey}-addresses`);
        const formattedlist = _.map(_.map(addresses, 'formatted_address'), ads => {
          const address = ads.split('\n').join(', ');
          return {
            value: address,
            label: address
          };
        });

        const count = `${formattedlist.length} address${formattedlist.length > 1 ? 'es' : ''}`;
        // eslint-disable-next-line max-len
        req.form.options.fields[`${addressKey}-select`].options = [{value: '-1', label: count}].concat(formattedlist);
      }
      super.getValues(req, res, callback);
    }

    locals(req, res, callback) {
      const isManual = req.query.step === 'manual';
      const locals = super.locals(req, res, callback);
      const postcode = req.sessionModel.get(`${addressKey}-postcode`);
      const section = this.options.route.replace(/^\//, '');
      const editLink = conditionalTranslate('pages.address-lookup.edit', req.translate) || defaults.CHANGE;
      const cantFind = conditionalTranslate('pages.address-lookup.cantfind', req.translate) || defaults.CANT_FIND;

      let postcodeApiMessageKey;
      let postcodeError;

      if (!isManual) {
        postcodeApiMessageKey = (req.sessionModel.get(`${addressKey}-postcodeApiMeta`) || {}).messageKey;
      }

      if (postcodeApiMessageKey) {
        const key = `pages.address-lookup.postcode-api.${postcodeApiMessageKey}`;
        postcodeError = conditionalTranslate(key, req.translate) ||
          defaults.POSTCODE_ERROR[postcodeApiMessageKey];
      }

      return _.merge({}, locals, {
        postcodeEntered: conditionalTranslate('pages.address-lookup.postcode-entered', req.translate) ||
          defaults.POSTCODE_ENTERED,
        enterManually: conditionalTranslate('pages.address.lookup.enter-manually', req.translate) ||
          defaults.ENTER_MANUALLY,
        route: this.options.route,
        editLink,
        cantFind,
        postcodeError,
        postcode,
        section
      });
    }

    process(req, res, callback) {
      if (req.query.step === 'postcode') {
        const postcode = req.form.values[`${addressKey}-postcode`];
        this.model.set({ postcode });
      }
      super.process(req, res, callback);
    }

    // eslint-disable-next-line consistent-return
    lookupPostcode(req, res, callback) {
      this.model.fetch()
        .then(data => {
          if (data.length) {
            req.sessionModel.set(`${addressKey}-addresses`, data);
          } else {
            req.sessionModel.unset(`${addressKey}-addresses`);
            req.sessionModel.set(`${addressKey}-postcodeApiMeta`, {
              messageKey: 'not-found'
            });
          }
          return callback();
        })
        .catch(err => {
          req.sessionModel.set(`${addressKey}-postcodeApiMeta`, {
            messageKey: 'cant-connect'
          });
          // eslint-disable-next-line no-console
          console.error('Postcode lookup error: ',
            `Code: ${err.status}; Detail: ${err.detail}`);
          return callback();
        });
    }

    saveValues(req, res, callback) {
      const step = req.query.step;
      if (step === 'postcode') {
        return this.lookupPostcode(req, res, err => {
          if (err) {
            return callback(err);
          }
          return super.saveValues(req, res, callback);
        });
      } else if (step === 'lookup') {
        const addressLines = req.form.values[`${addressKey}-select`].split(', ').join('\n');
        req.sessionModel.set(addressKey, addressLines);
      }
      return super.saveValues(req, res, callback);
    }

    // eslint-disable-next-line consistent-return
    validate(req, res, callback) {
      if (req.query.step === 'postcode' && this.model.get('validate')) {
        const key = `${addressKey}-postcode`;
        const postcode = encodeURIComponent(req.form.values[key]);
        this.model.validate(postcode)
          .then(() => super.validate(req, res, callback))
          .catch(e => {
            let err = e;
            // this code is set by the model for a validation error
            if (err.status === 418) {
              err = {
                [key]: new this.ValidationError(key, {
                  key,
                  type: err.type,
                  redirect: undefined
                }, req, res)
              };
            // cannot connect to validation service, skip api validation
            } else if (err.status === 403 || err.status === 404) {
              return super.validate(req, res, callback);
            }
            return callback(err);
          });
      } else {
        return super.validate(req, res, callback);
      }
    }

    getBackLink(req, res) {
      let backLink = super.getBackLink(req, res);
      if (_.includes(['manual', 'address', 'lookup'], req.query.step)) {
        backLink = req.path;
      }
      return backLink;
    }
  };
};
