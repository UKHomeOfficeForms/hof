
'use strict';

const getValue = (value, field, translate) => {
  if (Array.isArray(value)) {
    return value.map(item => getValue(item, field, translate));
  }
  const key = `fields.${field}.options.${value}.label`;
  let result = translate(key);
  if (result === key) {
    result = value;
  }
  return result;
};

module.exports = SuperClass => class extends SuperClass {
  getRowsForSummarySections(req) {
    const sections = req.form.options.sections;
    return Object.keys(sections)
      .map(section => {
        const fieldsInSection = sections[section].steps || sections[section];
        const omitFromPdf = sections[section].omitFromPdf || false;

        return {
          section: req.translate([
            `pages.confirm.sections.${section}.header`,
            `pages.${section}.header`
          ]),
          fields: this.getFieldsForRow(fieldsInSection, req),
          omitFromPdf
        };
      })
      .filter(section => section.fields.length);
  }

  getFieldsForRow(section, req) {
    const fieldsSpecifications = section || [];
    let populatedFields =
      fieldsSpecifications.map(fieldSpec => {
        let fieldData = {};

        if (typeof fieldSpec === 'string') {
          fieldData = this.getFieldData(fieldSpec, req);
        } else if (this.dependencySatisfied(fieldSpec, req)) {
          fieldData = Object.assign(this.getFieldData(fieldSpec.field, req), fieldSpec);
        }

        fieldData.value = fieldSpec.derivation ? this.runCombinerForDerivedField(fieldSpec, req) : fieldData.value;
        fieldData.value = (typeof fieldSpec.parse === 'function') ? fieldSpec.parse(fieldData.value) : fieldData.value;

        return fieldData;
      }).filter(f => f.value);

    populatedFields = populatedFields.flatMap(populatedField => {
      if (populatedField.value && populatedField.value.aggregatedValues) {
        return this.expandAggregatedFields(populatedField, req);
      }
      return populatedField;
    });

    return populatedFields;
  }

  runCombinerForDerivedField(fieldSpec, req) {
    const obj = Object.assign(this.getFieldData(fieldSpec.field, req), fieldSpec);

    const values = fieldSpec.derivation.fromFields
      .map(field => req.sessionModel.get(field)).filter(field => field && field.length > 0);
    if (values.length > 0) {
      obj.value = fieldSpec.derivation.combiner(values);
    }

    return obj.value;
  }

  dependencySatisfied(fieldSpec, req) {
    if (fieldSpec.dependsOn) {
      const dependencyValue = req.sessionModel.get(fieldSpec.dependsOn);
      if (!dependencyValue || dependencyValue === 'no') {
        return false;
      }
    }
    return true;
  }

  expandAggregatedFields(obj, req) {
    return obj.value.aggregatedValues.flatMap((element, index) => {
      const fields = element.fields.flatMap(inner => {
        const changeField = inner.changeField || inner.field;
        const changeLink = `${req.baseUrl}${obj.step}/edit/${index}/${changeField}?returnToSummary=true`;

        return Object.assign({}, inner, {
          changeLinkDescription: this.translateChangeLink(inner.field, req),
          value: inner.parsed || inner.value,
          label: this.translateLabel(inner.field, req),
          changeLink,
          index
        });
      });

      if (obj.addElementSeparators && index < obj.value.aggregatedValues.length - 1) {
        fields.push({ label: '', value: 'separator', changeLink: '', isSeparator: true });
      }

      return fields;
    });
  }

  getStepForField(key, steps) {
    return Object.keys(steps).filter(step => steps[step].fields && steps[step].fields.indexOf(key) > -1)[0];
  }


  translateLabel(key, req) {
    return req.translate([
      `pages.confirm.fields.${key}.label`,
      `fields.${key}.label`,
      `fields.${key}.legend`
    ]);
  }

  translateChangeLink(key, req) {
    return req.translate([`fields.${key}.changeLinkDescription`,
      `pages.confirm.fields.${key}.label`,
      `fields.${key}.summary`,
      `fields.${key}.label`,
      `fields.${key}.legend`]);
  }


  translateCheckBoxOptions(key, value, req) {
    if (Array.isArray(value)) {
      return value.map(val => this.translateCheckBoxOptions(key, val, req));
    }

    return req.translate(`fields[${key}].options.[${value}]`);
  }

  getFieldData(key, req) {
    const settings = req.form.options;
    let value = req.sessionModel.get(key);
    let changeLink;
    let step;

    const fieldIsCheckbox = value && req.form.options.fieldsConfig[key] &&
      (req.form.options.fieldsConfig[key].mixin === 'checkbox-group' ||
        req.form.options.fieldsConfig[key].mixin === 'radio-group');

    if (fieldIsCheckbox) {
      step = this.getStepForField(key, settings.steps);
      changeLink = `${req.baseUrl}${step}/edit#${key}-${value}`;
      value = this.translateCheckBoxOptions(key, value, req);

      return {
        changeLinkDescription: this.translateChangeLink(key, req),
        label: this.translateLabel(key, req),
        value,
        step,
        field: key,
        changeLink
      };
    }

    return {
      changeLinkDescription: this.translateChangeLink(key, req),
      label: this.translateLabel(key, req),
      value,
      step: this.getStepForField(key, settings.steps),
      field: key
    };
  }

  locals(req, res) {
    req.sessionModel.unset('returnToSummary');
    const rows = this.getRowsForSummarySections(req);
    return Object.assign({}, super.locals(req, res), {
      rows
    });
  }
};
