'use strict';

const _ = require('lodash');
const path = require('path');
const getFields = require('./fields');

const controller = require('../../controller/controller').prototype;
const utils = require('./utils');
const validation = require('./validation');

const TEMPLATE = path.resolve(__dirname, './templates/amount-with-unit-select.html');

module.exports = (key, opts) => {
  if (!key) {
    throw new Error('Key must be passed to amountWithUnitSelect component');
  }
  const fields = getFields(key);

  const options = opts || {};

  const template = options.template ?
    path.resolve(__dirname, options.template) :
    TEMPLATE;

  // takes the 2 parts (amount and unit), then creates a amountWithUnitSelect value
  // in the format [Amount]-[Unit] (e.g. 5-Kilograms) and saves to req.body for processing
  const preProcess = (req, res, next) => {
    const parts = utils.getParts(req.body, fields, key);
    if (_.some(parts, part => part !== '')) {
      req.body[key] = `${(parts.amount || '')}-${(parts.unit || '')}`;
    }
    next();
  };

  // given a amountWithUnitSelect form value entry exists in the request
  // the form values are set to the request body's value
  const postProcess = (req, res, next) => {
    if (req.form.values[key]) {
      req.form.values[key] = req.body[key];
    }
    next();
  };

  // modifies request to include custom validation
  const preValidate = (req, res, next) => {
    validation.addGroupedFieldsWithOptionsProperty(req.form.options.fields[key]);
    validation.resolveOptionalFields(req.form.options.fields, fields, options.validate, key);
    validation.propagateChildFieldValidation(req.form, fields, key);
    validation.addValidator(validation.createCustomEqualValidator(fields[`${key}-unit`].options));
    validation.addValidator(validation.isTwoHyphenSeparatedValues);

    // Add equal validation to amountWithUnitSelect-unit
    req.form.options.fields[`${key}-unit`].validate = _.uniq(
      req.form.options.fields[`${key}-unit`].validate.concat()
    );

    // moves validation errors that do not apply to the parent component to the 'amount' child component
    _.remove(req.form.options.fields?.amountWithUnitSelect?.validate, validator => {
      if(!((typeof validator === 'object' &&
        (validator.type === 'equal' ||
          validator.type === 'required')) ||
      (typeof validator === 'string' &&
        (validator === 'equal' ||
          validator === 'required')))) {
        if(req.form.options.fields['amountWithUnitSelect-amount'] === null) {
          Object.assign(req.form.options.fields, {
            'amountWithUnitSelect-amount': fields[`${key}-amount`] });
        }

        if(!req.form.options.fields['amountWithUnitSelect-amount']?.validate?.includes(validator)) {
          req.form.options.fields['amountWithUnitSelect-amount'].validate.push(validator);
        }

        return true;
      }
      return false;
    });

    next();
  };

  // if the amountWithUnitSelect field is included in errorValues (e.g. if there was a validation error),
  // extend errorValues with the individual components
  // i.e. add the component's key:value pair to the request sessionModel's attributes
  const preGetErrors = (req, res, next) => {
    const errorValues = req.sessionModel.get('errorValues');
    if (errorValues && errorValues[key]) {
      req.sessionModel.set('errorValues',
        Object.assign({}, errorValues, utils.getPartsFromAmountWithUnitSelect(errorValues[key], Object.keys(fields)))
      );
    }
    next();
  };

  // if the amountWithUnitSelect field or it's child fields have any recorded validation error,
  // the remaining errors are added to the request/req.form.errors
  // and their type is set to a null to avoid duplicate error messages
  const postGetErrors = (req, res, next) => {
    const errors = req.sessionModel.get('errors');
    if (errors && (errors[key] || errors[`${key}-amount`] || errors[`${key}-unit`])) {
      Object.assign(req.form.errors, Object.keys(fields).reduce((obj, field) =>
        Object.assign({}, obj, { [field]: { type: null } })
      , {}));
    }

    // if there are no errors in the parent but an error in one of the child component
    // this populates the child component's validation errors into req.form.errors
    // so they can be translated, rendered and displayed
    if(errors && !errors[key] && req?.form?.errors) {
      if(errors[`${key}-amount`] && req.form.errors[`${key}-amount`]) {
        req.form.errors[`${key}-amount`] = {
          errorLinkId: `${key}-amount`,
          key: errors[`${key}-amount`]?.key || `${key}-amount`,
          type: errors[`${key}-amount`]?.type || null
        };
        req.form.errors[`${key}-amount`].message =
          controller.getErrorMessage(req.form.errors[`${key}-amount`], req, res) ||
          controller.getErrorMessage({
            errorLinkId: `${key}-amount`,
            key: `${key}`,
            type: errors[`${key}-amount`]?.type || null
          }, req, res);
      } else if(errors[`${key}-unit`] && req.form.errors[`${key}-unit`]) {
        req.form.errors[`${key}-unit`] = {
          errorLinkId: `${key}-amount`,
          key: errors[`${key}-unit`]?.key || `${key}-unit`,
          type: errors[`${key}-unit`]?.type || null
        };
        req.form.errors[`${key}-unit`].message =
          controller.getErrorMessage(req.form.errors[`${key}-unit`], req, res) ||
          controller.getErrorMessage({
            errorLinkId: `${key}-amount`,
            key: `${key}`,
            type: errors[`${key}-unit`]?.type || null
          }, req, res);
      }
    }

    next();
  };

  // if amountWithUnitSelect value is set, split its parts and assign to req.form.values.
  // This is extended with errorValues if they are present
  const postGetValues = (req, res, next) => {
    const amountWithUnitSelect = req.form.values[key];
    if (amountWithUnitSelect) {
      Object.assign(
        req.form.values,
        utils.getPartsFromAmountWithUnitSelect(amountWithUnitSelect, Object.keys(fields)),
        req.sessionModel.get('errorValues') || {}
      );
    }
    next();
  };

  // renders the template to a string and assign the html output
  // to the amountWithUnitSelect field in res.locals.fields
  const preRender = (req, res, next) => {
    // sets unit options as either translations (if they exist) or default untranslated options
    const optionsToDisplay = utils.conditionalTranslate(`fields.${key}-unit.options`, req.translate) ||
      utils.conditionalTranslate(`fields.${key}.options`, req.translate) ||
      options.options;

    // resolves null/default select value's label and value
    const nullOptionLabel = optionsToDisplay.find(opt => opt.null !== undefined && Object.keys(opt).length === 1);
    const nonNullOptions = optionsToDisplay.filter(opt => opt.null === undefined || Object.keys(opt).length !== 1);
    fields[`${key}-unit`].options =
      [{label: (nullOptionLabel !== undefined ? nullOptionLabel.null : 'Select...'), value: ''}].concat(nonNullOptions);

    // labels the fields either by using (depending on which exists)
    // a specific sub-component translations label (translated amountWithUnitSelect-amount.label)
    // or the component's translation label (translated amountWithUnitSelect.amountLabel)
    // or the component's non-translated (amountWithUnitSelect.amountLabel)
    // or the default label (which is 'Amount' or 'Unit')
    fields[`${key}-amount`].label = utils.conditionalTranslate(`fields.${key}-amount.label`, req.translate) ||
      utils.conditionalTranslate(`fields.${key}.amountLabel`, req.translate) ||
      req.form.options.fields[`${key}`]?.amountLabel ||
      fields[`${key}-amount`].label;
    fields[`${key}-unit`].label = utils.conditionalTranslate(`fields.${key}-unit.label`, req.translate) ||
      utils.conditionalTranslate(`fields.${key}.unitLabel`, req.translate) ||
      req.form.options.fields[`${key}`]?.unitLabel ||
      fields[`${key}-unit`].label;

    Object.assign(req.form.options.fields, _.mapValues(fields, (v, k) => {
      const rawKey = k.replace(`${key}-`, '');
      const labelKey = `fields.${key}.parts.${rawKey}`;
      const label = req.translate(labelKey);
      return Object.assign({}, v, {
        label: label === labelKey ? v.label : label
      });
    }));

    const legend = utils.conditionalTranslate(`fields.${key}.legend`, req.translate) ||
      req.form.options.fields[`${key}`]?.legend;
    const hint = utils.conditionalTranslate(`fields.${key}.hint`, req.translate) ||
      req.form.options.fields[`${key}`]?.hint;
    const legendClassName = utils.getLegendClassName(options);
    const isPageHeading = utils.getIsPageHeading(options);
    const error = req.form.errors &&
      (req.form.errors[key] || req.form.errors[`${key}-amount`] || req.form.errors[`${key}-unit`]);

    res.render(template, { key, legend, legendClassName, isPageHeading, hint, error }, (err, html) => {
      if (err) {
        next(err);
      } else {
        const field = res.locals.fields.find(f => f.key === key);
        Object.assign(field, { html });
        next();
      }
    });
  };

  // return config extended with hooks
  return Object.assign({}, options, {
    hooks: {
      'pre-process': preProcess,
      'post-process': postProcess,
      'pre-getErrors': preGetErrors,
      'post-getErrors': postGetErrors,
      'post-getValues': postGetValues,
      'pre-render': preRender,
      'pre-validate': preValidate
    }
  });
};
