'use strict';

const _ = require('lodash');

/**
 * Translates a field property (given its key and a translation function),
 * returning null if there is no translation (enabling conditional statements to branch if there is no translation).
 * @param {string} key - The key of the field property to translate
 * (E.G. 'fields.amountWithUnitSelect-amount.label' - references the amount field label).
 * @param {function(string): string} translate - The translation function to apply.
 * @returns {string|null} Returns the translation or null if there is no translation.
 */
const conditionalTranslate = (key, translate) => {
  let result = translate(key);
  if (result === key) {
    result = null;
  }
  return result;
};

/**
 * Gets the classname specified for the field's legend.
 * Defaults to an empty string if not specified.
 * @param {object} field - The field with (potentially) the legend classname.
 * @returns {string} The classname specified for the field's legend text.
 */
const getLegendClassName = field =>
  field?.legend?.className || '';

/**
 * Gets a boolean determining if the field's heading has been set to be the page heading.
 * @param {Object} field - The field with the heading to (potentially) make the page title.
 * @returns {string} A boolean that indicates if the field's heading is also the page heading.
 */
const getIsPageHeading = field =>
  field?.isPageHeading || '';

/**
 * Creates a new object with the component's assigned 'amount' and 'unit' values.
 * It does this by looking for the 'amountWithUnitSelect-amount' and 'amountWithUnitSelect-unit' fields in req.body
 * and making a new object that copies those 2 fields and values, and removes the 'amountWithUnitSelect-' suffix.
 * @param {Object} body - The submitted request's body (req.body) containing K:V pairs
 * (E.G. 'amountWithUnitSelect-amount : 12').
 * @param {Object} fields - The set of fields relevant to this component (I.E. fields defined in ./fields.js).
 * @param {string} key - The grouped child fields' parent name/key ('amountWithUnitSelect' in this case).
 * @returns {{ amount: string, unit: string }} Returns a map of values in the format { amount: '1', unit: 'litres' }.
 */
const getParts = (body, fields, key) =>
  _.mapKeys(_.pick(body, Object.keys(fields)), (value, fieldKey) =>
    fieldKey.replace(`${key}-`, '')
  );

/**
 * Splits the AmountWithUnitSelect value (usually in the format '[Amount]-[Unit]') by the last hyphen in the text
 * into an Array with 2 elements (the amount and unit - the value before and after the hyphen respectively).
 * Returns an empty string for each element if in an unexpected format.
 * @param {string} amountWithUnitSelectVal - The amountWithUnitSelect value (E.G. '1-Litre').
 * @returns {string[]} Returns an array in format [amount, unit].
 */
const getAmountWithUnitSelectValues = amountWithUnitSelectVal => {
  const splitPointIndex = typeof amountWithUnitSelectVal === 'string' ?
    amountWithUnitSelectVal.lastIndexOf('-') :
    -1;

  return splitPointIndex === -1 ?
    ['', ''] :
    [amountWithUnitSelectVal.substring(0, splitPointIndex), amountWithUnitSelectVal.substring(splitPointIndex + 1)];
};

/**
 * Returns a map of the component's fields' keys and their assigned values.
 * (E.G. If amountWithUnitSelectVal = 1-L,
 * it returns { amountWithUnitSelect-amount: '1', amountWithUnitSelect-unit: 'L' }).
 * @param {string} amountWithUnitSelectVal - AmountWithUnitSelect value in the format '[Amount]-[Unit]'.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @returns {amountWithUnitSelect-amount: string, amountWithUnitSelect-unit: string} Returns a map of K:V pairs
 * for each child field.
 */
const getPartsFromAmountWithUnitSelect = (amountWithUnitSelectVal, fields) =>
  getAmountWithUnitSelectValues(amountWithUnitSelectVal).reduce(
    (obj, value, index) => Object.assign({},
      obj,
      {[fields[index]]: value }),
    {});

/**
 * Translates the labels of the child fields of the AmountWithUnitSelect component.
 * Depending on which exists, labels are set in the following order of precedence:
 * 1. A specific child-component translation (I.E. amountWithUnitSelect-amount.label).
 * 2. A parent-component translation for the child field (I.E. amountWithUnitSelect.amountLabel).
 * 3. A specific child-component (non-translated) label configuration.
 * 4. A parent-component (non-translated) label configuration for the child field.
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {string} pKey - The parent component's key (E.G. 'amountWithUnitSelect').
 * @param {string[]} keys - The list of child components (by keys) to translate (E.G. ['amount', 'unit']).
 */
const translateLabels = (req, fields, pKey, keys) => {
  keys.forEach(key => {
    fields[`${pKey}-${key}`].label =
      conditionalTranslate(`fields.${pKey}-${key}.label`, req.translate) ||
      conditionalTranslate(`fields.${pKey}.${key}Label`, req.translate) ||
      fields[`${pKey}-${key}`].label ||
      req.form.options.fields[`${pKey}`]?.[`${key}Label`];
  });
};

/**
 * Adds the component's child fields to the request's form options fields (req.form.options.fields).
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {string} key - The parent component's key (E.G. 'amountWithUnitSelect').
 */
const addChildFieldsToRequestForm = (req, fields, key) => {
  Object.assign(req.form.options.fields, _.mapValues(fields, (v, k) => {
    const rawKey = k.replace(`${key}-`, '');
    const labelKey = `fields.${key}.parts.${rawKey}`;
    const label = req.translate(labelKey);

    return Object.assign({}, v, {
      label: label === labelKey ? v.label : label
    });
  }));
};

/**
 * Sets a default null option for a select component if undefined.
 * The default null option has a label of 'Select...' and a value of an empty string.
 * @param {Object[]} options - The dropdown menu options.
 * @returns {Object[]} Returns the options with the null/default option resolved.
 */
const resolveNullOption = options => {
  const nullOptionLabel = options.find(opt => opt.null !== undefined && Object.keys(opt).length === 1);
  const nonNullOptions = options.filter(opt => opt.null === undefined || Object.keys(opt).length !== 1);

  return [{label: (nullOptionLabel !== undefined ? nullOptionLabel.null : 'Select...'), value: ''}]
    .concat(nonNullOptions);
};

/**
 * Translates the unit field's/component's options (dropdown menu options) for the AmountWithUnitSelect component.
 * Also resolves the null/default select option's label and value.
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {Object} options - The component's configuration options.
 * @param {String} key - The parent component's key (E.G. 'amountWithUnitSelect').
 */
const translateUnitOptions = (req, fields, options, key) => {
  // sets unit options as either translations (if they exist) or default untranslated options
  const optionsToDisplay = conditionalTranslate(`fields.${key}-unit.options`, req.translate) ||
    conditionalTranslate(`fields.${key}.options`, req.translate) ||
    options.options;

  // resolves the null/default select option
  fields[`${key}-unit`].options = resolveNullOption(optionsToDisplay);
};

/**
 * Constructs an object with field data required to render the AmountWithUnitSelect component.
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {Object} options - The component's configuration options.
 * @param {string} key - The parent component's key.
 * @returns {Object} Returns an object with field data required to render the component.
 */
const constructFieldToRender = (req, fields, options, key) => {
  addChildFieldsToRequestForm(req, fields, key);

  const reqForm = req.form;
  const legend = conditionalTranslate(`fields.${key}.legend`, req.translate) ||
    reqForm.options.fields[`${key}`]?.legend;
  const hint = conditionalTranslate(`fields.${key}.hint`, req.translate) ||
    reqForm.options.fields[`${key}`]?.hint;
  const legendClassName = getLegendClassName(options);
  const isPageHeading = getIsPageHeading(options);
  const error = reqForm.errors && (
    (reqForm.errors[key]?.type && reqForm.errors[key]) ||
    reqForm.errors[`${key}-amount`]?.type && reqForm.errors[`${key}-amount`] ||
    reqForm.errors[`${key}-unit`]?.type && reqForm.errors[`${key}-unit`]
  );

  return { key, legend, legendClassName, isPageHeading, hint, error };
};

module.exports = {
  conditionalTranslate,
  getLegendClassName,
  getIsPageHeading,
  getParts,
  getAmountWithUnitSelectValues,
  getPartsFromAmountWithUnitSelect,
  translateLabels,
  addChildFieldsToRequestForm,
  resolveNullOption,
  translateUnitOptions,
  constructFieldToRender
};
