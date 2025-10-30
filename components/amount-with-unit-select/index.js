'use strict';

const _ = require('lodash');
const path = require('path');
const getFields = require('./fields');
const controller = require('../../controller/controller');

const TEMPLATE = path.resolve(__dirname, './templates/amount-with-unit-select.html');

// utility function that, using the
// req.body (the set of key:values pairs submitted in the request like 'amountWithUnitSelect-amount : 12'),
// fields (the set of fields relevant to this component - i.e. fields defined in ./fields.js),
// key (the name for parent of the grouped child fields - so 'amountWithUnitSelect' in this case)
// returns a map of values in the format:
// {
//   amount: '1',
//   unit: 'litres',
// }
// it does this by looking for the 'amountWithUnitSelect-amount' and 'amountWithUnitSelect-unit' fields in req.body
// and making a new object that copies those 2 fields and values, and removes the 'amountWithUnitSelect-' suffix
const getParts = (body, fields, key) =>
  _.mapKeys(_.pick(body, Object.keys(fields)), (value, fieldKey) =>
    fieldKey.replace(`${key}-`, '')
  );

// accepts an amountWithUnitSelect value in the format [Amount]-[Unit]
// returns array in format [amount, value]
const getAmountWithUnitSelectValues = amountWithUnitSelectVal => {
  const splitPointIndex = amountWithUnitSelectVal.lastIndexOf('-');
  return splitPointIndex === -1 ?
    ['', ''] :
    [amountWithUnitSelectVal.substring(0, splitPointIndex), amountWithUnitSelectVal.substring(splitPointIndex + 1)];
};

// accepts an amountWithUnitSelect value in the format [Amount]-[Unit] and fields config,
// returns a map of key:value pairs for the intermediate fields
const getPartsFromAmountWithUnitSelect = (amountWithUnitSelectVal, fields) =>
  getAmountWithUnitSelectValues(amountWithUnitSelectVal).reduce(
    (obj, value, index) => Object.assign({},
      obj,
      {[fields[index]]: value }),
    {});

const conditionalTranslate = (key, translate) => {
  let result = translate(key);
  if (result === key) {
    result = null;
  }
  return result;
};

const getLegendClassName = field =>
  field && field.legend && field.legend.className || '';

const getIsPageHeading = field =>
  field && field.isPageHeading || '';

module.exports = (key, opts) => {
  if (!key) {
    throw new Error('Key must be passed to amountWithUnitSelect component');
  }
  const fields = getFields(key);

  const options = opts || {};
  // creates a custom version of the default equals validator (usually set for all select components),
  // which evaluates the translated (if exists) select options declared in the amountWithUnitSelect-unit component
  const amountWithUnitSelectValidator = [{
    type: 'amount-with-unit-select',
    arguments: _.map(fields[`${key}-unit`].options, option =>
      typeof option === 'string' ? option : option.value
    )}];
  options.validate = _.uniq(options.validate ?
    amountWithUnitSelectValidator.concat(options.validate) :
    amountWithUnitSelectValidator
  );

  const template = options.template ?
    path.resolve(__dirname, options.template) :
    TEMPLATE;

  // takes the 2 parts (amount and unit), then creates a amountWithUnitSelect value
  // in the format [Amount]-[Unit] (e.g. 5-Kilograms) and saves to req.body for processing
  const preProcess = (req, res, next) => {
    const parts = getParts(req.body, fields, key);
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
    // this prevents the 'equal' validator being applied to the grouped component by default
    // this is so the validator can be added to the unit child component values instead of it's parent component's value
    req.form.options.fields[key].groupedFieldsWithOptions = true;

    // finds and edits validator arguments to pass a the list of translated/resolved options
    // created and stored in the field options during the initilisation of the component
    const assignedEqualsValidatorIndex = options?.validate.findIndex(
      validator =>
        typeof validator === 'object' &&
        'arguments' in validator);

    if(req.form.options.fields[key]?.validate[assignedEqualsValidatorIndex] !== null) {
      req.form.options.fields[key].validate[assignedEqualsValidatorIndex].arguments =
        assignedEqualsValidatorIndex >= 0 ?
          fields[`${key}-unit`].options :
          options.validate[assignedEqualsValidatorIndex].arguments;
    }

    // adds existing required validators from parent component to child components
    // and resolves configurations for child components to be optional
    const isAmountValOptional = req.form.options.fields[key].amountOptional === 'true';
    const isUnitValOptional = req.form.options.fields[key].unitOptional === 'true';
    const parentIsRequired = options.validate?.indexOf('required') !== -1;
    if(!isAmountValOptional || parentIsRequired) {
      fields[`${key}-amount`].validate = _.uniq(fields[`${key}-amount`].validate.concat('required'));
    }
    if(!isUnitValOptional || parentIsRequired) {
      fields[`${key}-unit`].validate = _.uniq(fields[`${key}-unit`].validate.concat('required'));
    }

    // child component field data and values are put into req.form.options.fields and req.form.values respectively
    // so they can be validated if needed
    Object.assign(req.form.options.fields,
      { 'amountWithUnitSelect-amount': fields[`${key}-amount`] },
      { 'amountWithUnitSelect-unit': fields[`${key}-unit`] }
    );
    const amountWithUnitSelectValues = getAmountWithUnitSelectValues(req.form.values.amountWithUnitSelect);
    Object.assign(req.form.values,
      { 'amountWithUnitSelect-amount': amountWithUnitSelectValues[0] },
      { 'amountWithUnitSelect-unit': amountWithUnitSelectValues[1] }
    );

    // moves validation errors that do not apply to the parent component to the 'amount' child component
    _.remove(req.form.options.fields?.amountWithUnitSelect?.validate, validator => {
      if(!((typeof validator === 'object' &&
        (validator.type === 'amount-with-unit-select' ||
          validator.type === 'equals' ||
          validator.type === 'required')) ||
      (typeof validator === 'string' &&
        (validator === 'amount-with-unit-select' ||
          validator === 'equals' ||
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
        Object.assign({}, errorValues, getPartsFromAmountWithUnitSelect(errorValues[key], Object.keys(fields)))
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
          controller.prototype.getErrorMessage(req.form.errors[`${key}-amount`], req, res) ||
          controller.prototype.getErrorMessage({
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
          controller.prototype.getErrorMessage(req.form.errors[`${key}-unit`], req, res) ||
          controller.prototype.getErrorMessage({
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
        getPartsFromAmountWithUnitSelect(amountWithUnitSelect, Object.keys(fields)),
        req.sessionModel.get('errorValues') || {}
      );
    }
    next();
  };

  // renders the template to a string and assign the html output
  // to the amountWithUnitSelect field in res.locals.fields
  const preRender = (req, res, next) => {
    // sets unit options as either translations (if they exist) or default untranslated options
    const optionsToDisplay = conditionalTranslate(`fields.${key}-unit.options`, req.translate) ||
      conditionalTranslate(`fields.${key}.options`, req.translate) ||
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
    fields[`${key}-amount`].label = conditionalTranslate(`fields.${key}-amount.label`, req.translate) ||
      conditionalTranslate(`fields.${key}.amountLabel`, req.translate) ||
      req.form.options.fields[`${key}`]?.amountLabel ||
      fields[`${key}-amount`].label;
    fields[`${key}-unit`].label = conditionalTranslate(`fields.${key}-unit.label`, req.translate) ||
      conditionalTranslate(`fields.${key}.unitLabel`, req.translate) ||
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

    const legend = conditionalTranslate(`fields.${key}.legend`, req.translate) ||
      req.form.options.fields[`${key}`]?.legend;
    const hint = conditionalTranslate(`fields.${key}.hint`, req.translate) ||
      req.form.options.fields[`${key}`]?.hint;
    const legendClassName = getLegendClassName(options);
    const isPageHeading = getIsPageHeading(options);
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
