'use strict';

const _ = require('lodash');
const path = require('path');
const getFields = require('./fields');
const controller = require('../../controller/controller');

const TEMPLATE = path.resolve(__dirname, './templates/amount-with-unit-select.html');

// utility function that, using the 
// req.body (which contains the key:values pairs submitted in the request like 'amountWithUnitSelect-amount : 12'), 
// fields (the set of fields we're concerned with - the ones defined in ./fields.js),
// key (the parent name for the grouped fields - so 'amountWithUnitSelect in this' case)
// returns a map of values in the format:
// {
//   amount: '1',
//   unit: 'litres',
// }
// it does this by looking for the 'amountWithUnitSelect-amount' and 'amountWithUnitSelect-unit' fields in req.body
// and making a new object that copies those 2 fields and values, and removing the 'amountWithUnitSelect-' suffix
const getParts = (body, fields, key) =>
  _.mapKeys(_.pick(body, Object.keys(fields)), (value, fieldKey) =>
    fieldKey.replace(`${key}-`, '')
  );

// accepts an amountWithUnitSelect value in the format [Amount]-[Unit]
// returns array in format [amount, value]
const getAmountWithUnitSelectValues = (amountWithUnitSelectVal) => {
  const splitPointIndex = amountWithUnitSelectVal.lastIndexOf('-');
  return splitPointIndex === -1 ? 
    ['', ''] :
    [amountWithUnitSelectVal.substring(0, splitPointIndex), amountWithUnitSelectVal.substring(splitPointIndex + 1)];
}

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
  // creates and sets default equals validator for option components, but room to customize arguments
  const amountWithUnitSelectValidator = [{
    type: 'amount-with-unit-select', 
    arguments: _.map(fields[`${key}-unit`].options, option =>
      typeof option === 'string' ? option : 
      option.value
  )}];
  options.validate = _.uniq(options.validate ? 
    amountWithUnitSelectValidator.concat(options.validate) : 
    amountWithUnitSelectValidator);

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

  // defaultFormatters on the base controller replace '--' with '-' on the process step.
  // This ensures having the correct number of hyphens, so values do not jump from unit to amount.
  // This should only be done on a partially completed amountWithUnitSelect field otherwise the validation messages break.
  const postProcess = (req, res, next) => {
    const value = req.form.values[key];
    if (value) {
      req.form.values[key] = req.body[key];
    }
    next();
  };

  // modified request to include custom validation
  const preValidate = (req, res, next) => {
    // prevent the 'equal' validator being applied to the grouped component by default
    // this is so the validator can be added to the sub component instead of the group component
    req.form.options.fields[key].groupedFieldsWithOptions = true;

    // finds and edits validator arguments to pass a the list of translated options in the sub-component
    const assignedEqualsValidatorIndex = options?.validate.findIndex(
      (validator) => 
        typeof validator === 'object' && 
        'arguments' in validator);

    if(req.form.options.fields[key]?.validate[assignedEqualsValidatorIndex] !== null)
      req.form.options.fields[key].validate[assignedEqualsValidatorIndex].arguments = assignedEqualsValidatorIndex >= 0 ? 
        fields[`${key}-unit`].options :
        options.validate[assignedEqualsValidatorIndex].arguments;

    // Add required validators from parent component to child components
    const isAmountValOptional = req.form.options.fields[key].amountOptional === 'true';
    const isUnitValOptional = req.form.options.fields[key].unitOptional === 'true';
    const parentIsRequired = options.validate?.indexOf('required') != -1;
    if(!isAmountValOptional || parentIsRequired)
      fields[`${key}-amount`].validate = _.uniq(fields[`${key}-amount`].validate.concat('required'));
    if(!isUnitValOptional || parentIsRequired)
      fields[`${key}-unit`].validate = _.uniq(fields[`${key}-unit`].validate.concat('required'));

    // logic to deal with one of the 2 sub-fields being optionals
    //if(isAmountValOptional ^ isUnitValOptional) {}
    Object.assign(req.form.options.fields,
      { 'amountWithUnitSelect-amount' : fields[`${key}-amount`] },
      { 'amountWithUnitSelect-unit' : fields[`${key}-unit`] } 
    );
    // child component values are put into req.form.values so they can be validated if needed
    const amountWithUnitSelectValues = getAmountWithUnitSelectValues(req.form.values['amountWithUnitSelect']);
      Object.assign(req.form.values,
        { 'amountWithUnitSelect-amount' : amountWithUnitSelectValues[0] },
        { 'amountWithUnitSelect-unit' : amountWithUnitSelectValues[1] }
      );

    // moves validation errors that do not apply to the group component to the amount sub-component
    _.remove(req.form.options.fields?.amountWithUnitSelect?.validate, (validator) => {
      if(!((typeof validator === 'object' && 
      (validator.type === 'amount-with-unit-select' || validator.type === 'equals' || validator.type === 'required')) ||
      (typeof validator === 'string' && 
      (validator.type === 'amount-with-unit-select' || validator.type === 'equals' || validator.type === 'required')))) {
        if(req.form.options.fields['amountWithUnitSelect-amount'] == null)
          Object.assign(req.form.options.fields, { 
            'amountWithUnitSelect-amount' : fields[`${key}-amount`] });

        if(!req.form.options.fields['amountWithUnitSelect-amount']?.validate?.includes(validator))
          req.form.options.fields['amountWithUnitSelect-amount'].validate.push(validator);

        return true
      }
    });

    next();
  };

  // if amountWithUnitSelect field is included in errorValues, extend
  // errorValues with the individual components
  const preGetErrors = (req, res, next) => {
    const errorValues = req.sessionModel.get('errorValues');
    if (errorValues && errorValues[key]) {
      req.sessionModel.set('errorValues',
        Object.assign({}, errorValues, getPartsFromAmountWithUnitSelect(errorValues[key], Object.keys(fields)))
      );
    }
    next();
  };

  // if amountWithUnitSelect field has any validation error, also add errors
  // for the two child components. we make them null type as we don't want to show
  // duplicate messages
  const postGetErrors = (req, res, next) => {
    const errors = req.sessionModel.get('errors');
    // if there are errors recorded for the child components of the parent component
    // the parent and child key:value pairs and stored in req.form.errors 
    // to indicate an error for the whole component
    if (errors && (errors[key] || errors[`${key}-amount`] || errors[`${key}-unit`])) {
      Object.assign(req.form.errors, Object.keys(fields).reduce((obj, field) =>
        Object.assign({}, obj, { [field]: { type: null } })
      , {}));
    };

    // if there is no error in parent component or no error in one of it's 2 child component
    // this populates amountWithUnitSelect child component's validation errors into req.form.errors 
    // so they can be translated, rendered and displayed
    if(errors && !errors[key] && req?.form?.errors) {
      if(errors[`${key}-amount`] && req.form.errors[`${key}-amount`]) {
        req.form.errors[`${key}-amount`] = {
          errorLinkId : `${key}-amount`,
          key : errors[`${key}-amount`]?.key || `${key}-amount`,
          type : errors[`${key}-amount`]?.type || null
        };
        req.form.errors[`${key}-amount`].message = 
          controller.prototype.getErrorMessage(req.form.errors[`${key}-amount`], req, res) ||
          controller.prototype.getErrorMessage({
            errorLinkId : `${key}-amount`,
            key : `${key}`,
            type : errors[`${key}-amount`]?.type || null
          }, req, res);
      }
      else if(errors[`${key}-unit`] && req.form.errors[`${key}-unit`]) {
        req.form.errors[`${key}-unit`] = {
          errorLinkId : `${key}-amount`,
          key : errors[`${key}-unit`]?.key || `${key}-unit`,
          type : errors[`${key}-unit`]?.type || null
        };
        req.form.errors[`${key}-unit`].message = 
          controller.prototype.getErrorMessage(req.form.errors[`${key}-unit`], req, res) ||
          controller.prototype.getErrorMessage({
            errorLinkId : `${key}-amount`,
            key : `${key}`,
            type : errors[`${key}-unit`]?.type || null
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

  // render the template to a string, assign the html output
  // to the amount-with-unit-select field in res.locals.fields
  const preRender = (req, res, next) => {
    //Set unit options as either translations (if they exist) or default untranslated options 
    const optionsToDisplay = conditionalTranslate(`fields.${key}-unit.options`, req.translate) || 
      conditionalTranslate(`fields.${key}.options`, req.translate) || 
      options.options;

    //Resolves null/default select value's label and value
    const nullOptionLabel = optionsToDisplay.find((opt) => opt['null'] !== undefined && Object.keys(opt).length === 1);
    const nonNullOptions = optionsToDisplay.filter((opt) => opt["null"] === undefined || Object.keys(opt).length !== 1);
    fields[`${key}-unit`].options = [{label: (nullOptionLabel !== undefined ? nullOptionLabel['null'] : 'Select...'), value: ''}].concat(nonNullOptions);

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