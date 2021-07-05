
'use strict';

const _ = require('lodash');

const getValue = (value, field, translate) => {
if (Array.isArray(value)) {
  return value.map((item) => getValue(item, field, translate));
}
const key = `fields.${field}.options.${value}.label`;
let result = translate(key);
if (result === key) {
  result = value;
}
return result;
};

module.exports = SuperClass => class extends SuperClass {
  parseSections(req) {
    const settings = req.form.options;
    const sections = this.getSectionSettings(settings);
    return Object.keys(sections)
      .map(section => {
        const fields = sections[section] || [];
        return {
          section: req.translate([
            `pages.confirm.sections.${section}.header`,
            `pages.${section}.header`
          ]),
          fields: _.flatten(fields.map(field => this.getFieldData(field, req)))
            .map(f => {
              if (!f.value && f.value !== 0 && settings.nullValue) {
                f.value = req.translate(settings.nullValue);
              }
              return f;
            })
            .filter(f => (f.value || f.value === 0))
        };
      })
      .filter(section => section.fields.length);
  }

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

  getStepForField(key, steps) {
    return Object.keys(steps).filter(step => {
      return steps[step].fields && steps[step].fields.indexOf(key) > -1;
    })[0];
  }

  getFieldData(key, req) {
    const settings = req.form.options;
    if (typeof key === 'string') {
      return {
        label: req.translate([
          `pages.confirm.fields.${key}.label`,
          `fields.${key}.summary`,
          `fields.${key}.label`,
          `fields.${key}.legend`
        ]),
        changeLinkDescription: req.translate([
          `pages.confirm.fields.${key}.changeLinkDescription`,
          `fields.${key}.changeLinkDescription`,
          `pages.confirm.fields.${key}.label`,
          `fields.${key}.summary`,
          `fields.${key}.label`,
          `fields.${key}.legend`
        ]),
        value: getValue(req.sessionModel.get(key), key, req.translate),
        step: this.getStepForField(key, settings.steps),
        field: key
      };
    } else if (typeof key.field === 'string') {
      const obj = Object.assign(this.getFieldData(key.field, req), key);
      if (key.derivation) {
        const fromFields = _.castArray(key.derivation.fromFields);
        if (typeof key.derivation.combiner === 'function') {
          const values = fromFields
            .map(field => getValue(req.sessionModel.get(field), field, req.translate))
            .filter(it => it);
          if (values.length > 0) {
            obj.value = key.derivation.combiner(values);
          }
        }
      }
      if (typeof key.parse === 'function') {
        obj.value = key.parse(obj.value);
      }
      return obj;
    }
    return {};
  }

  locals(req, res) {
    return Object.assign({}, super.locals(req, res), {
      rows: this.parseSections(req)
    });
  }
};
