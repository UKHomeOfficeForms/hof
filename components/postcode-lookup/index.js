/* eslint-disable func-names */
'use strict';

const path = require('path');
const querystring = require('querystring');
const _ = require('lodash');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

const defaults = require('./defaults');

const PostcodeLookup = require('./postcode-lookup');

const logger = createLogger({
  format: combine(timestamp(), json()),
  transports: [new transports.Console({level: 'info', handleExceptions: true})]
});

const conditionalTranslate = (key, customFormTranslation) => {
  let result = customFormTranslation(key);
  if (result === key) {
    result = null;
  }
  return result;
};

const getFields = (fieldPrefix, customFormTranslation, requiredValidate, req) => ({
  [`${fieldPrefix}-postcode`]: {
    label: conditionalTranslate(`fields.${fieldPrefix}-postcode.label`, customFormTranslation) ||
    defaults.POSTCODE_LABEL,
    labelClassName: 'visuallyhidden',
    hint: conditionalTranslate(`fields.${fieldPrefix}-postcode.hint`, customFormTranslation) || defaults.POSTCODE_HINT,
    mixin: 'input-text',
    validate: requiredValidate ? ['required', 'postcodeValidation'] : 'postcodeValidation',
    formatter: 'uppercase',
    className: ['govuk-input', 'govuk-input--width-10']
  },
  [`${fieldPrefix}-select`]: {
    label: conditionalTranslate(`fields.${fieldPrefix}-select.label`, customFormTranslation) || defaults.SELECT_LABEL,
    mixin: 'radio-group',
    validate: 'required',
    options: req.sessionModel.get('addressesOptions')
  },
  [fieldPrefix]: {
    label: conditionalTranslate(`fields.${fieldPrefix}.label`, customFormTranslation) || defaults.ADDRESS_LINE_1_LABEL,
    mixin: 'input-text',
    validate: 'required',
    labelClassName: 'bold'
  },
  [`${fieldPrefix}-address-line-2`]: {
    label: conditionalTranslate(`fields.${fieldPrefix}-address-line-2.label`, customFormTranslation) ||
    defaults.ADDRESS_LINE_2_LABEL,
    mixin: 'input-text',
    'ignore-defaults': true,
    labelClassName: 'bold'
  },
  [`${fieldPrefix}-town-or-city`]: {
    label: conditionalTranslate(`fields${fieldPrefix}-town-or-city.label`, customFormTranslation) ||
    defaults.TOWN_OR_CITY_LABEL,
    mixin: 'input-text',
    validate: 'required',
    'ignore-defaults': true,
    labelClassName: 'bold'
  },
  [`${fieldPrefix}-postcode-manual`]: {
    label: conditionalTranslate(`fields.${fieldPrefix}-postcode-manual.label`, customFormTranslation) ||
    defaults.POSTCODE_MANUAL_LABEL,
    mixin: 'input-text',
    validate: requiredValidate ? ['required', 'postcodeValidation'] : 'postcodeValidation',
    formatter: 'uppercase',
    className: ['govuk-input', 'govuk-input--width-10'],
    labelClassName: 'bold'
  }
});

const getConfig = fieldNamePrefix => ({
  postcode: {
    fields: [`${fieldNamePrefix}-postcode`],
    template: 'postcode'
  },
  lookup: {
    fields: [`${fieldNamePrefix}-select`],
    template: 'address-lookup'
  },
  manual: {
    fields: [`${fieldNamePrefix}`, `${fieldNamePrefix}-address-line-2`, `${fieldNamePrefix}-town-or-city`,
      `${fieldNamePrefix}-postcode-manual`],
    template: 'address'
  },
  postcodeSearchIssue: {
    fields: [],
    template: 'postcode-search-problem'
  }
});

module.exports = config => {
  let postcode = '';
  let apiKey;
  let apiURL;
  let required;
  let addressFieldNamePrefix;

  if (config !== undefined) {
    apiKey = config.apiKey;
    apiURL = config.apiURL;
    required = config.required;
    addressFieldNamePrefix = config.addressFieldNamePrefix;
  }

  return superclass => class extends superclass {
    configure(req, res, callback) {
      req.query.step = req.query.step || 'postcode';
      const subSteps = getConfig(addressFieldNamePrefix);
      const step = subSteps[req.query.step];
      _.merge(req.form.options, {
        subSteps,
        addressKey: addressFieldNamePrefix,
        fields: _.pick(getFields(addressFieldNamePrefix, req.translate, required, req), step.fields),
        apiError: null
      });
      if (step.template) {
        req.form.options.template = path.resolve(__dirname, `./templates/${step.template}.html`);
      }
      super.configure(req, res, callback);
    }

    getNextStep(req, res, callback) {
      const step = super.getNextStep(req, res, callback);

      if (req.query.step === 'postcode' && req.form.values[`${addressFieldNamePrefix}-postcode`]) {
        let nextSubStep = '';
        // Go to manual entry page with pre-populated fields
        nextSubStep = req.sessionModel.get(`${addressFieldNamePrefix}-addresses`) ? 'lookup' : 'address';
        const qs = querystring.stringify(_.merge({}, req.query, {
          step: nextSubStep
        }));
        return `?${qs}`;
      } else if (req.query.step === 'lookup' && req.sessionModel.get(`${addressFieldNamePrefix}-select`) !== '') {
        req.form.values[`${addressFieldNamePrefix}-select`] =
        req.form.options.fields[`${addressFieldNamePrefix}-select`].apiAddress;
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

    constructAddressLineValues(addressAttributes) {
      const addressLines = {
        addressLine1: '',
        addressLine2: ''
      };

      if (addressAttributes.ORGANISATION_NAME !== undefined && addressAttributes.BUILDING_NAME !== undefined &&
        addressAttributes.BUILDING_NUMBER !== undefined) {
        addressLines.addressLine1 = addressAttributes.ORGANISATION_NAME + ', ' + addressAttributes.BUILDING_NAME;
        addressLines.addressLine2 = addressAttributes.BUILDING_NUMBER + ' ' + addressAttributes.THOROUGHFARE_NAME;
      } else if (addressAttributes.ORGANISATION_NAME !== undefined && addressAttributes.BUILDING_NAME !== undefined) {
        addressLines.addressLine1 = addressAttributes.ORGANISATION_NAME + ', ' + addressAttributes.BUILDING_NAME;
        addressLines.addressLine2 = addressAttributes.THOROUGHFARE_NAME;
      } else if (addressAttributes.ORGANISATION_NAME !== undefined && addressAttributes.BUILDING_NUMBER !== undefined) {
        addressLines.addressLine1 = addressAttributes.ORGANISATION_NAME;
        addressLines.addressLine2 = addressAttributes.BUILDING_NUMBER + ' ' + addressAttributes.THOROUGHFARE_NAME;
      } else if (addressAttributes.SUB_BUILDING_NAME !== undefined && addressAttributes.BUILDING_NUMBER !== undefined &&
        addressAttributes.THOROUGHFARE_NAME !== undefined) {
        addressLines.addressLine1 = addressAttributes.SUB_BUILDING_NAME + ', ' + addressAttributes.BUILDING_NUMBER +
        ' ' + addressAttributes.THOROUGHFARE_NAME;
      } else if (addressAttributes.BUILDING_NAME !== undefined && addressAttributes.THOROUGHFARE_NAME !== undefined) {
        addressLines.addressLine1 = addressAttributes.BUILDING_NAME + ' ' + addressAttributes.THOROUGHFARE_NAME;
      } else {
        addressLines.addressLine1 = addressAttributes.BUILDING_NUMBER + ' ' + addressAttributes.THOROUGHFARE_NAME;
      }

      return addressLines;
    }

    buildAddressOptions(req, addresses) {
      req.sessionModel.set('addressesOptions', addresses.map(obj => {
        const addressLines = this.constructAddressLineValues(obj);
        const addressValue = obj.ADDRESS;
        const townOrCity = obj.POST_TOWN;
        // Get element ID to be used in determining if radio button is checked in the saveValues section
        const radioButtonId = `${addressFieldNamePrefix}-select-${obj.ADDRESS}`;
        return {
          elementId: radioButtonId,
          label: addressValue,
          value: addressValue,
          addressLine1: addressLines.addressLine1,
          addressLine2: addressLines.addressLine2,
          townOrCity: townOrCity
        };
      }));
    }

    createRadioGroupField(req, addresses) {
      req.form.options.fields[`${addressFieldNamePrefix}-select`] = {
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

    getValues(req, res, callback) {
      if (req.query.step === 'lookup') {
        const addresses = req.sessionModel.get(`${addressFieldNamePrefix}-addresses`);
        this.buildAddressOptions(req, addresses);
        this.createRadioGroupField(req, addresses);
      }
      super.getValues(req, res, callback);
    }

    locals(req, res, callback) {
      const isManualStep = req.query.step === 'manual';
      const locals = super.locals(req, res, callback);
      const sessionPostcode = req.sessionModel.get(`${addressFieldNamePrefix}-postcode`);
      const section = this.options.route.replace(/^\//, '');
      const editLink = conditionalTranslate('pages.address-lookup.edit', req.translate) || defaults.CHANGE;
      const searchByPostcodeLink = conditionalTranslate('pages.address.searchByPostcode', req.translate) ||
      defaults.SEARCH_BY_POSTCODE;
      const cantFind = conditionalTranslate('pages.address-lookup.cantfind', req.translate) || defaults.CANT_FIND;

      if (isManualStep) {
        req.form.values['postcode-manual'] = sessionPostcode;
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
          defaults.POSTCODE_ERROR['error-heading'],
        postcodeEntered: sessionPostcode,
        addressesExist: (req.sessionModel.get(`${addressFieldNamePrefix}-addresses`) !== undefined &&
        req.sessionModel.get(`${addressFieldNamePrefix}-addresses`).length > 0) ? true : false,
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
          defaults.POSTCODE_ERROR['lookup-problem-title'],
        route: this.options.route,
        editLink,
        cantFind,
        searchByPostcodeLink,
        section
      });
    }

    async postcode(req, res, callback) {
      // Clear the value stored in the addresses radio button group
      req.sessionModel.set(`${addressFieldNamePrefix}-select`, '');
      // Call OS Places API to return list of addresses by postcode
      const enteredPostcode = req.form.values[`${addressFieldNamePrefix}-postcode`];

      await PostcodeLookup(enteredPostcode, apiURL, apiKey)
        .then(function (response) {
          if(response.data) {
            const addressList = [];
            _.forOwn(response.data.results, function (value) {
              addressList.push(value.DPA);
            });

            req.sessionModel.set(`${addressFieldNamePrefix}-addresses`, addressList);
            return callback();
          }
          throw new Error('Unexpected postcode response data structure');
        }).catch(error => {
          return callback(error);
        });
    }

    setupRadioButton(req, addresses) {
      req.form.options.fields[`${addressFieldNamePrefix}-addresses`] = {
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

    clearAddressFieldValues(req) {
      req.form.values[`${addressFieldNamePrefix}`] = '';
      req.form.values[`${addressFieldNamePrefix}-address-line-2`] = '';
      req.form.values[`${addressFieldNamePrefix}-town-or-city`] = '';
      req.form.values[`${addressFieldNamePrefix}-postcode-manual`] = '';
    }

    setFieldValuesInManualEntryPage(req) {
      const addressResult = req.form.options.fields[`${addressFieldNamePrefix}-select`].options.filter(obj => {
        return obj.value === req.form.values[`${addressFieldNamePrefix}-select`].replace(/[!?<>{}]/g, '');
      });
      const addressLine1 = addressResult[0].addressLine1;
      const addressLine2 = addressResult[0].addressLine2;
      const townOrCity = addressResult[0].townOrCity;
      req.form.values[`${addressFieldNamePrefix}`] = addressLine1;
      req.form.values[`${addressFieldNamePrefix}-address-line-2`] = addressLine2;
      req.form.values[`${addressFieldNamePrefix}-town-or-city`] = townOrCity;
      req.form.values[`${addressFieldNamePrefix}-postcode-manual`] = postcode;
      req.sessionModel.set('lookup-postcode', postcode);
      req.sessionModel.set('lookup-address-line-1', addressLine1);
      req.sessionModel.set('lookup-address-line-2', addressLine2);
      req.sessionModel.set('lookup-town-or-city', townOrCity);

      req.form.values[`${addressFieldNamePrefix}-select`] =
      req.form.options.fields[`${addressFieldNamePrefix}-select`].apiAddress;
    }

    saveValues(req, res, callback) {
      const step = req.query.step;
      if (step === 'postcode') {
        postcode = req.form.values[`${addressFieldNamePrefix}-postcode`];
        this.clearAddressFieldValues(req);
        return this.postcode(req, res, err => {
          if (err) {
            logger.log({
              level: 'info',
              message: `Error returned by postcode API: ${err}`
            });
            req.sessionModel.set('addresses', []);
            return res.redirect(req.baseUrl + '/postcode?step=postcodeSearchIssue');
          }
          return super.saveValues(req, res, callback);
        });
      } else if (step === 'lookup') {
        this.setFieldValuesInManualEntryPage(req);
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
