'use strict';

const _ = require('lodash');
const utils = require('./utils');

// checks if the field's value is a sting that is 2 hyphen separated values presented 
// e.g. '1-Litre'
const isTwoHyphenSeparatedValues = (value) => {
    if(typeof value !== 'string' || value.indexOf('-') === -1) {
        return false;
    }

    const selectValue = [value.split('-').pop()];
    return Array.isArray(selectValue) &&
        selectValue.length;
}

const createCustomEqualValidator = (options) => [{
    type: 'equal',
    arguments: _.map(options, opt =>
        typeof opt === 'string' ? opt : opt.value)
}];

const addValidator = (field, newValidator) => 
    field.validate = _.uniq(field.validate.concat(newValidator));

// this prevents the 'equal' validator being applied to the grouped component by default
// this is so the validator can be added to the unit child component values instead of it's parent component's value
const addGroupedFieldsWithOptionsProperty = (field) =>
    field.groupedFieldsWithOptions = true; 

// adds existing required validators from parent component to child components
// and resolves configurations for child components to be optional
const resolveOptionalFields = (parentField, childFields, validators, key) => {
    validators?.indexOf('required') !== -1 || parentField[key]?.amountOptional !== 'true' && 
        addValidator(childFields[`${key}-amount`], 'required');
    validators?.indexOf('required') !== -1 || parentField[key]?.unitOptional !== 'true' && 
        addValidator(childFields[`${key}-unit`], 'required');
}

// child component field data and values are put into req.form.options.fields and req.form.values respectively
// so they can be validated if needed
const propagateChildFieldValidation = (formReq, fields, key) => {
    Object.assign(formReq.options.fields,
        { 'amountWithUnitSelect-amount': fields[`${key}-amount`] },
        { 'amountWithUnitSelect-unit': fields[`${key}-unit`] }
    );
    const amountWithUnitSelectValues = utils.getAmountWithUnitSelectValues(formReq.values.amountWithUnitSelect);
    Object.assign(formReq.values,
        { 'amountWithUnitSelect-amount': amountWithUnitSelectValues[0] },
        { 'amountWithUnitSelect-unit': amountWithUnitSelectValues[1] }
    );
}

module.exports = { 
    isTwoHyphenSeparatedValues,
    createCustomEqualValidator,
    addValidator,
    addGroupedFieldsWithOptionsProperty,
    resolveOptionalFields,
    propagateChildFieldValidation
}