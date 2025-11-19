'use strict';

const _ = require('lodash');

/**
 * Creates a new object with the component's/field's assigned 'amount' and 'unit' values
 * it does this by looking for the 'amountWithUnitSelect-amount' and 'amountWithUnitSelect-unit' fields in req.body
 * and making a new object that copies those 2 fields and values, and removes the 'amountWithUnitSelect-' suffix
 * 
 * @param {Object} body - The submitted request's body (req.body) containing K:V pairs (E.G. 'amountWithUnitSelect-amount : 12')
 * @param {Object} fields - The set of fields relevant to this component (I.E. fields defined in ./fields.js)
 * @param {string} key - The grouped child fields' parent name/key ('amountWithUnitSelect' in this case)
 * @returns {{ amount: string, unit: string }} Returns a map of values in the format { amount: '1', unit: 'litres' } 
 */
const getParts = (body, fields, key) =>
  _.mapKeys(_.pick(body, Object.keys(fields)), (value, fieldKey) =>
    fieldKey.replace(`${key}-`, '')
  );

/**
 * Splits the AmountWithUnitSelect value (usually in the format '[Amount]-[Unit]') by the last hyphen in the text
 * into an Array with 2 elements (the amount and unit - the value before and after the hyphen respectively).
 * Returns and empty string for each element if in an unexpect format
 * 
 * @param {string} amountWithUnitSelectVal - The amountWithUnitSelect value (E.G. '1-Litre')
 * @returns {string[]} Returns an array in format [amount, Unit]
 */
const getAmountWithUnitSelectValues = amountWithUnitSelectVal => {
  const splitPointIndex = amountWithUnitSelectVal.lastIndexOf('-');
  return splitPointIndex === -1 ?
    ['', ''] :
    [amountWithUnitSelectVal.substring(0, splitPointIndex), amountWithUnitSelectVal.substring(splitPointIndex + 1)];
};

/**
 * Returns a map of the component's fields' keys and their assigned values
 * (E.G. If amountWithUnitSelectVal = 1-L, it returns { amountWithUnitSelect-amount: '1', amountWithUnitSelect-unit: 'L' })
 * 
 * @param {*} amountWithUnitSelectVal - AmountWithUnitSelect value in the format '[Amount]-[Unit]'
 * @param {*} fields - The component's children field definitions and configurations
 * @returns {amountWithUnitSelect-amount: string, amountWithUnitSelect-unit: string} Returns a map of K:V pairs for each child field
 */
const getPartsFromAmountWithUnitSelect = (amountWithUnitSelectVal, fields) =>
  getAmountWithUnitSelectValues(amountWithUnitSelectVal).reduce(
    (obj, value, index) => Object.assign({},
      obj,
      {[fields[index]]: value }),
    {});

/**
 * Translates a field property (given it's key and a translation function)
 * returning null if there is no translation (enabling conditional statements to branch if there is no translation)
 * 
 * @param {string} key - The key of the field property to translate (E.G. 'fields.amountWithUnitSelect-amount.label' - references the amount field label)
 * @param {function(string): string} translate - The translation function to apply
 * @returns {string|null} Returns the translation or null if there is no translation
 */
const conditionalTranslate = (key, translate) => {
  let result = translate(key);
  if (result === key) {
    result = null;
  }
  return result;
};

/**
 * Gets the classname specified for the field's legend
 * Defaults to an empty string if not specified
 * 
 * @param {object} field - The field with (potentially) the legend classname
 * @returns {string} The classname specified fo the field's legend text
 */
const getLegendClassName = field =>
  field?.legend?.className || '';

/**
 * Gets a boolean determining if the field's heading has been set to be the page heading
 * 
 * @param {Object} field - The field with the heading to (potentially) make the page title
 * @returns {string} A boolean the indicates if the field's heading is also the page heading
 */
const getIsPageHeading = field =>
  field?.isPageHeading || '';

module.exports = { 
    getParts, 
    getAmountWithUnitSelectValues, 
    getPartsFromAmountWithUnitSelect, 
    conditionalTranslate, 
    getLegendClassName, 
    getIsPageHeading
}