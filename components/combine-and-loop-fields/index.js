
const _ = require('lodash');
const uuid = require('uuid').v1;
const path = require('path');
const express = require('express');

module.exports = config => {
  const { returnTo, groupName, fieldsToGroup, combineValuesToSingleField, removePrefix, groupOptional } = config;

  if (removePrefix && typeof removePrefix !== 'string') {
    throw new Error('removePrefix is a string and is optional for loops');
  }

  if (combineValuesToSingleField && typeof combineValuesToSingleField !== 'string') {
    throw new Error('combineValuesToSingleField is a string and is optional for loops');
  }

  if (!returnTo || typeof returnTo !== 'string') {
    throw new Error('returnTo is a string and is required for loops');
  }

  if (!groupName || typeof groupName !== 'string') {
    throw new Error('groupName is a string and is required for loops');
  }

  if (!fieldsToGroup ||
    !fieldsToGroup.length ||
    !Array.isArray(fieldsToGroup) ||
    _.some(fieldsToGroup, field => typeof field !== 'string')) {
    throw new Error('fieldsToGroup is an array of strings and is required for loops');
  }

  return superclass => class extends superclass {
    get(req, res, next) {
      if (req.query.delete) {
        const router = express.Router({ mergeParams: true });
        router.use([
          // eslint-disable-next-line no-underscore-dangle
          this._configure.bind(this),
          this.removeItem.bind(this),
          this.reload.bind(this)
        ]);
        return router.handle(req, res, next);
      }
      return super.get(req, res, next);
    }

    getLoopFields(req) {
      let loopedFields = _.pick(req.sessionModel.toJSON(), fieldsToGroup);

      if (removePrefix) {
        loopedFields = _.mapKeys(loopedFields, (value, key) => key.replace(removePrefix, ''));
      }
      return loopedFields;
    }

    removeItem(req, res, next) {
      const id = req.query.delete;
      const items = req.sessionModel.get(groupName).filter(item => item.id !== id);
      req.sessionModel.set(groupName, items);
      next();
    }

    // eslint-disable-next-line no-unused-vars
    reload(req, res, next) {
      const items = req.sessionModel.get(groupName);
      if (!items.length) {
        req.sessionModel.set(`${groupName}-saved`, false);
        fieldsToGroup.forEach(field => {
          req.sessionModel.unset(field);
        });
      }

      const target = (items.length || groupOptional) ? req.form.options.route : returnTo;
      const action = req.params.action || '';
      res.redirect(path.join(req.baseUrl, target, action));
    }

    configure(req, res, next) {
      const field = `${groupName}-add-another`;
      // add yes/no field
      req.form.options.fields[field] = Object.assign({
        mixin: 'radio-group',
        validate: ['required'],
        options: [
          'yes', 'no'
        ],
        legend: {
          className: 'visuallyhidden'
        }
      }, req.form.options.fieldSettings);

      // add conditonal fork
      req.form.options.forks = req.form.options.forks || [];
      req.form.options.forks.push({
        target: returnTo,
        continueOnEdit: true,
        condition: {
          field: field,
          value: 'yes'
        }
      });
      next();
    }

    getValues(req, res, next) {
      const fieldsGroup = req.sessionModel.get(groupName) || [];
      const added = req.sessionModel.get(`${groupName}-saved`);
      return super.getValues(req, res, (err, values) => {
        if (err) {
          return next(err);
        }
        if (!added) {
          const fields = this.getLoopFields(req);
          if (!_.isEmpty(fields)) {
            const newField = Object.assign({id: uuid()}, fields);

            if (combineValuesToSingleField) {
              const combinedValues = _.filter(fieldsToGroup.map(field => req.sessionModel.get(field))).join(', ');
              newField[combineValuesToSingleField] = combinedValues;
            }

            fieldsGroup.push(newField);
            values[groupName] = fieldsGroup;
            fieldsToGroup.forEach(field => req.sessionModel.unset(field));

            req.sessionModel.set(groupName, fieldsGroup);
            req.sessionModel.set(`${groupName}-saved`, true);
          }
        }
        return next(null, values);
      });
    }

    locals(req, res) {
      const items = req.form.values[groupName] || [];
      return Object.assign({}, super.locals(req, res), {
        items,
        hasItems: items.length > 0,
        field: groupName
      });
    }

    saveValues(req, res, next) {
      // remove "yes" value from session so it is no pre-populated next time around
      super.saveValues(req, res, err => {
        const field = `${groupName}-add-another`;
        if (req.form.values[field] === 'yes') {
          req.sessionModel.unset(field);
          req.sessionModel.set(`${groupName}-saved`, false);
        }
        next(err);
      });
    }
  };
};
