
'use strict';

const concat = (x, y) => x.concat(y);
const flatMap = (f, xs) => xs.map(f).reduce(concat, []);

module.exports = SuperClass => class extends SuperClass {
  getSectionSettings(settings) {
    if (settings.sections) {
      return settings.sections;
    }
    return Object.keys(settings.steps).reduce((map, key) => {
      const fields = settings.steps[key].fields;
      if (fields) {
        map[key.replace(/^\//, '')] = fields;
      }
      return map;
    }, {});
  }

  getRowsForSummarySections(req) {
    const settings = req.form.options;
    const sections = this.getSectionSettings(settings);
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
        const multipleRows = fieldSpec.multipleRowsFromAggregate;
        const useOriginalValue = fieldSpec.useOriginalValue;

        if (typeof fieldSpec === 'string' || multipleRows) {
          fieldData = this.getFieldData(fieldSpec, req, useOriginalValue);
        } else if (this.dependencySatisfied(fieldSpec, req)) {
          fieldData = Object.assign(this.getFieldData(fieldSpec.field, req, useOriginalValue), fieldSpec);
        }

        if (!multipleRows) {
          fieldData.value = fieldSpec.derivation ?
            this.runCombinerForDerivedField(fieldSpec, req) : fieldData.value;
          fieldData.value = (typeof fieldSpec.parse === 'function') ?
            fieldSpec.parse(fieldData.value) : fieldData.value;
        }

        return fieldData;
      }).filter(f => f.value || Array.isArray(f));

    populatedFields = flatMap(populatedField => {
      if (populatedField.value && populatedField.value.aggregatedValues) {
        return this.expandAggregatedFields(populatedField, req);
      }
      return populatedField;
    }, populatedFields);

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
    return flatMap((element, index) => {
      const fields = flatMap(inner => {
        const changeField = inner.changeField || inner.field;
        const changeLink = `${req.baseUrl}${obj.step}/edit/${index}/${changeField}?returnToSummary=true`;

        return Object.assign({}, inner, {
          changeLinkDescription: this.translateChangeLink(inner.field, req),
          value: inner.parsed || inner.value,
          label: this.translateLabel(inner.field, req),
          changeLink,
          index
        });
      }, element.fields);

      if (obj.addElementSeparators && index < obj.value.aggregatedValues.length - 1) {
        fields.push({ label: '', value: 'separator', changeLink: '', isSeparator: true });
      }

      return fields;
    }, obj.value.aggregatedValues);
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

  getFieldData(key, req, useOriginalValue) {
    if (this.isCheckbox(key, req)) {
      return this.parseCheckBoxField(key, req, useOriginalValue);
    }

    return key.multipleRowsFromAggregate ?
      this.parseMultipleFields(key, req) :
      this.parseSingleField(key, req);
  }

  isCheckbox(key, req) {
    return req.sessionModel.get(key) && req.form.options.fieldsConfig[key] &&
      (req.form.options.fieldsConfig[key].mixin === 'checkbox-group' ||
        req.form.options.fieldsConfig[key].mixin === 'radio-group');
  }

  parseCheckBoxField(key, req, useOriginalValue) {
    let value = req.sessionModel.get(key);
    const step = this.getStepForField(key, req.form.options.steps);
    const changeLink = `${req.baseUrl}${step}/edit#${key}-${value}`;
    value = useOriginalValue ? value : this.translateCheckBoxOptions(key, value, req);

    return {
      changeLinkDescription: this.translateChangeLink(key, req),
      label: this.translateLabel(key, req),
      value,
      step,
      field: key,
      changeLink
    };
  }

  parseMultipleFields(key, req) {
    const multipleRows = key.multipleRowsFromAggregate;
    const labelCategory = multipleRows.labelCategory;
    const valueCategory = multipleRows.valueCategory;
    const translationValue = multipleRows.valueTranslation || multipleRows.valueCategory;

    return req.sessionModel.get(key.field).map(input => {
      return {
        field: key.field,
        step: key.step,
        changeLinkDescription: this.translateChangeLink(key.field, req),
        label: input[labelCategory],
        value: [].concat(input[valueCategory])
          .map(category => req.translate(`fields.${translationValue}.options.${category}.label`))
          .join('\n')
      };
    }).filter(f => f.value);
  }

  parseSingleField(key, req) {
    return {
      changeLinkDescription: this.translateChangeLink(key, req),
      label: this.translateLabel(key, req),
      value: req.sessionModel.get(key),
      step: this.getStepForField(key, req.form.options.steps),
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
