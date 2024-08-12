/* eslint-disable func-names */
'use strict';

const axios = require('axios');
const path = require('path');
const querystring = require('querystring');
const _ = require('lodash');

const defaults = require('./defaults');

const conditionalTranslate = (key, t) => {
  let result = t(key);
  if (result === key) {
    result = null;
  }
  return result;
};

const getFields = (key, t, requiredValidate, req) => ({
  [`${key}-postcode`]: {
    label: conditionalTranslate(`fields.${key}-postcode.label`, t) || defaults.POSTCODE_LABEL,
    labelClassName: 'visuallyhidden',
    hint: conditionalTranslate(`fields.${key}-postcode.hint`, t) || defaults.POSTCODE_HINT,
    mixin: 'input-text',
    validate: requiredValidate ? ['required', 'postcodeValidation'] : 'postcodeValidation',
    formatter: 'uppercase',
    className: ['govuk-input', 'govuk-input--width-10']
  },
  [`${key}-select`]: {
    label: conditionalTranslate(`fields.${key}-select.label`, t) || defaults.SELECT_LABEL,
    mixin: 'radio-group',
    validate: 'required',
    options: req.sessionModel.get('addressesOptions')
  },
  [key]: {
    label: conditionalTranslate(`fields.${key}.label`, t) || defaults.ADDRESS_LINE_1_LABEL,
    mixin: 'input-text',
    validate: 'required',
    labelClassName: 'bold'
  },
  [`${key}-address-line-2`]: {
    label: conditionalTranslate(`fields.${key}-address-line-2.label`, t) || defaults.ADDRESS_LINE_2_LABEL,
    mixin: 'input-text',
    'ignore-defaults': true,
    labelClassName: 'bold'
  },
  [`${key}-town-or-city`]: {
    label: conditionalTranslate(`fields${key}-town-or-city.label`, t) || defaults.TOWN_OR_CITY_LABEL,
    mixin: 'input-text',
    validate: 'required',
    'ignore-defaults': true,
    labelClassName: 'bold'
  },
  [`${key}-postcode-manual`]: {
    label: conditionalTranslate(`fields.${key}-postcode-manual.label`, t) || defaults.POSTCODE_MANUAL_LABEL,
    mixin: 'input-text',
    validate: requiredValidate ? ['required', 'postcodeValidation'] : 'postcodeValidation',
    formatter: 'uppercase',
    className: ['govuk-input', 'govuk-input--width-10'],
    labelClassName: 'bold'
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
  manual: {
    fields: [`${key}`, `${key}-address-line-2`, `${key}-town-or-city`, `${key}-postcode-manual`],
    template: 'address'
  },
  postcodeSearchIssue: {
    fields: [],
    template: 'postcode-search-problem'
  }
});

module.exports = config => {
  let postcode = '';
  const apiKey = config.apiKey;
  const apiURL = config.apiURL;
  const required = config.required;
  const addressKey = config.addressKey;

  return superclass => class extends superclass {
    configure(req, res, callback) {
      req.query.step = req.query.step || 'postcode';
      const subSteps = getConfig(addressKey);
      const step = subSteps[req.query.step];
      _.merge(req.form.options, {
        subSteps,
        addressKey,
        fields: _.pick(getFields(addressKey, req.translate, required, req), step.fields),
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
        let nextSubStep = '';
        // Go to manual entry page with pre-populated fields
        nextSubStep = req.sessionModel.get(`${addressKey}-addresses`) ? 'lookup' : 'address';
        const qs = querystring.stringify(_.merge({}, req.query, {
          step: nextSubStep
        }));
        return `?${qs}`;
      } else if (req.query.step === 'lookup' && req.sessionModel.get(`${addressKey}-select`) !== '') {
        req.form.values[`${addressKey}-select`] = req.form.options.fields[`${addressKey}-select`].apiAddress;
        let nextSubStep = '';
        nextSubStep = 'manual';
        req.query.step = 'manual';
        req.form.values.address = '';
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
        req.sessionModel.set('addressesOptions', addresses.map(obj => {
          const addressValue = obj.ADDRESS;

          // Different addresses have different properties returned by the API
          let addressLine1 = '';
          let addressLine2 = '';
          if (obj.ORGANISATION_NAME !== undefined && obj.BUILDING_NAME !== undefined &&
            obj.BUILDING_NUMBER !== undefined) {
            addressLine1 = obj.ORGANISATION_NAME + ', ' + obj.BUILDING_NAME;
            addressLine2 = obj.BUILDING_NUMBER + ' ' + obj.THOROUGHFARE_NAME;
          } else if (obj.ORGANISATION_NAME !== undefined && obj.BUILDING_NAME !== undefined) {
            addressLine1 = obj.ORGANISATION_NAME + ', ' + obj.BUILDING_NAME;
            addressLine2 = obj.THOROUGHFARE_NAME;
          } else if (obj.ORGANISATION_NAME !== undefined && obj.BUILDING_NUMBER !== undefined) {
            addressLine1 = obj.ORGANISATION_NAME;
            addressLine2 = obj.BUILDING_NUMBER + ' ' + obj.THOROUGHFARE_NAME;
          } else if (obj.BUILDING_NAME !== undefined && obj.THOROUGHFARE_NAME !== undefined) {
            addressLine1 = obj.BUILDING_NAME + ' ' + obj.THOROUGHFARE_NAME;
          } else {
            addressLine1 = obj.BUILDING_NUMBER + ' ' + obj.THOROUGHFARE_NAME;
          }

          const townOrCity = obj.POST_TOWN;
          // Get element ID to be used in determining if radio button is checked in the saveValues section
          const radioButtonId = `${addressKey}-select-${obj.ADDRESS}`;
          return {
            elementId: radioButtonId,
            label: addressValue,
            value: addressValue,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            townOrCity: townOrCity
          };
        }));

        req.form.options.fields[`${addressKey}-select`] = {
          mixin: 'radio-group',
          legend: {
            className: 'visuallyhidden'
          },
          className: 'govuk-radios--inline',
          validate: ['required'],
          options: req.sessionModel.get('addressesOptions')
        };
        req.sessionModel.set('addressCount', addresses.length);
      }
      super.getValues(req, res, callback);
    }

    locals(req, res, callback) {
      const isManual = req.query.step === 'manual';
      const locals = super.locals(req, res, callback);
      const sessionPostcode = req.sessionModel.get(`${addressKey}-postcode`);
      const section = this.options.route.replace(/^\//, '');
      const editLink = conditionalTranslate('pages.address-lookup.edit', req.translate) || defaults.CHANGE;
      const searchByPostcodeLink = conditionalTranslate('pages.address.searchByPostcode', req.translate) ||
      defaults.SEARCH_BY_POSTCODE;
      const cantFind = conditionalTranslate('pages.address-lookup.cantfind', req.translate) || defaults.CANT_FIND;

      let postcodeApiMessageKey;
      let postcodeError;

      if (!isManual) {
        postcodeApiMessageKey = (req.sessionModel.get(`${addressKey}-postcodeApiMeta`) || {}).messageKey;
      } else {
        req.form.values['postcode-manual'] = sessionPostcode;
      }

      if (postcodeApiMessageKey) {
        const key = `pages.address-lookup.postcode-api.${postcodeApiMessageKey}`;
        postcodeError = conditionalTranslate(key, req.translate) ||
          defaults.POSTCODE_ERROR[postcodeApiMessageKey];
      }

      let addressCount = '';
      if (req.sessionModel.get('addressCount') === 1) {
        addressCount = '1 address for ';
      } else {
        addressCount = req.sessionModel.get('addressCount') + ' addresses for ';
      }

      return _.merge({}, locals, {
        enterManually: conditionalTranslate('pages.address.lookup.enter-manually', req.translate) ||
          defaults.ENTER_MANUALLY,
        postcodeHeading: conditionalTranslate('pages.postcode.postcode-heading', req.translate) ||
          defaults.POSTCODE_HEADING,
        addressLookupHeading: conditionalTranslate('pages.address-lookup.address-lookup-heading', req.translate) ||
          defaults.ADDRESS_LOOKUP_HEADING,
        manualAddressHeading: conditionalTranslate('pages.address-lookup.manual-address-heading', req.translate) ||
          defaults.MANUAL_ADDRESS_HEADING,
        manualAddressParagraph: conditionalTranslate('pages.address-lookup.manual-address-paragraph', req.translate) ||
          defaults.MANUAL_ADDRESS_PARAGRAPH,
        searchErrorHeading: conditionalTranslate('pages.postcode-search-problem.searchErrorHeading', req.translate) ||
          defaults.SEARCH_ERROR_HEADING,
        postcodeEntered: sessionPostcode,
        addressesExist: (req.sessionModel.get('addresses') !== undefined &&
        req.sessionModel.get('addresses').length > 0) ? true : false,
        noAddressHeading: conditionalTranslate('pages.postcode-search-problem.noAddressHeading', req.translate) ||
          defaults.NO_ADDRESS_HEADING,
        addressCount: addressCount,
        postcodeSearchTitle: conditionalTranslate('pages.postcode-search.title', req.translate) ||
          defaults.ADDRESS_LOOKUP_SEARCH_TITLE,
        addressLookupTitle: conditionalTranslate('pages.address-lookup.title', req.translate) ||
          defaults.ADDRESS_LOOKUP_TITLE,
        addressDetailsTitle: conditionalTranslate('pages.address-details.title', req.translate) ||
          defaults.ADDRESS_DETAILS_TITLE,
        lookupProblemTitle: conditionalTranslate('pages.address-lookup-problem.title', req.translate) ||
          defaults.ADDRESS_LOOKUP_PROBLEM_TITLE,
        route: this.options.route,
        editLink,
        cantFind,
        searchByPostcodeLink,
        postcodeError,
        section
      });
    }

    postcode(req, res, callback) {
      // Clear the value stored in the addresses radio button group
      req.sessionModel.set(`${addressKey}-select`, '');
      // Call OS Places API to return list of addresses by postcode
      const enteredPostcode = req.form.values[`${addressKey}-postcode`];

      axios.get(apiURL + '?postcode=' +  enteredPostcode + '&key=' + apiKey)
        .then(function (response) {
          const addressList = [];
          _.forOwn(response.data.results, function (value) {
            addressList.push(value.DPA);
          });

          req.sessionModel.set(`${addressKey}-addresses`, addressList);
          return callback();
        }).catch(error => {
          if(error.response.status === '404' || error.response.status === '429' ||
            error.response.status === '503' || error.response.status === '500') {
            req.query.step === 'postcodeSearchIssue';
          }
          return callback(error);
        });
    }

    setupRadioButton(req, addresses) {
      req.form.options.fields[`${addressKey}-addresses`] = {
        mixin: 'radio-group',
        isPageHeading: true,
        validate: ['required'],
        options: addresses.map(obj => {
          const addressValue = obj.ADDRESS;
          return {
            label: addressValue,
            value: addressValue
          };
        })
      };
    }

    saveValues(req, res, callback) {
      const step = req.query.step;
      if (step === 'postcode') {
        postcode = req.form.values[`${addressKey}-postcode`];
        req.form.values[`${addressKey}`] = '';
        req.form.values[`${addressKey}-address-line-2`] = '';
        req.form.values[`${addressKey}-town-or-city`] = '';
        req.form.values[`${addressKey}-postcode-manual`] = '';
        return this.postcode(req, res, err => {
          if (err) {
            req.sessionModel.set('addresses', []);
            return res.redirect(req.baseUrl + '/postcode?step=postcodeSearchIssue');
          }
          return super.saveValues(req, res, callback);
        });
      } else if (step === 'lookup') {
        const addressResult = req.form.options.fields[`${addressKey}-select`].options.filter(obj => {
          return obj.value === req.form.values[`${addressKey}-select`];
        });
        const addressLine1 = addressResult[0].addressLine1;
        const addressLine2 = addressResult[0].addressLine2;
        const townOrCity = addressResult[0].townOrCity;
        req.form.values[`${addressKey}`] = addressLine1;
        req.form.values[`${addressKey}-address-line-2`] = addressLine2;
        req.form.values[`${addressKey}-town-or-city`] = townOrCity;
        req.form.values[`${addressKey}-postcode-manual`] = postcode;
        req.sessionModel.set('lookup-postcode', postcode);
        req.sessionModel.set('lookup-address-line-1', addressLine1);
        req.sessionModel.set('lookup-address-line-2', addressLine2);
        req.sessionModel.set('lookup-town-or-city', townOrCity);

        req.form.values[`${addressKey}-select`] = req.form.options.fields[`${addressKey}-select`].apiAddress;
      }
      return super.saveValues(req, res, callback);
    }

    getBackLink(req, res) {
      let backLink = super.getBackLink(req, res);
      if (_.includes(['manual', 'address', 'lookup'], req.query.step)) {
        backLink = req.baseUrl + req.path;
      }
      return backLink;
    }
  };
};
