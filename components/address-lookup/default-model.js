'use strict';

const _ = require('lodash');
const Model = require('../../model');
const defaults = require('./defaults');

const IS_VALIDATING = 'IS_VALIDATING';

module.exports = class PostcodesModel extends Model {
  constructor(options) {
    super(options);
    this.options = _.merge({}, defaults.POSTCODE_API, options);
  }

  url() {
    const validating = this.get(IS_VALIDATING);
    const options = {
      url: validating ?
        `${this.options.hostname}/${this.options.paths.validate}/${this.get('postcode')}` :
        `${this.options.hostname}/${this.options.paths.lookup}`
    };
    if (!validating) {
      options.query = {
        postcode: this.get('postcode')
      };
    }
    return super.url(options);
  }

  requestConfig(options) {
    return _.merge(super.requestConfig(options), {
      timeout: 5000,
      headers: {
        Authorization: this.options.authorization
      }
    });
  }

  validate() {
    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      this.set(IS_VALIDATING, true);
      let allowedCountries = this.options.validate && this.options.validate.allowedCountries;
      if (!allowedCountries) {
        return resolve();
      }

      const getError = () => {
        const err = new Error('Validation Error');
        err.status = 418;
        err.type = 'country';
        return err;
      };

      if (this.get('postcode').toUpperCase().startsWith('BT')) {
        return reject(getError());
      }

      this.fetch()
        .then(data => {
          this.set(IS_VALIDATING, false);
          if (data && data.country && data.country.name) {
            allowedCountries = _.castArray(allowedCountries).map(c => c.toLowerCase());
            if (allowedCountries.indexOf(data.country.name.toLowerCase()) === -1) {
              return reject(getError());
            }
          }
          return resolve();
        })
        .catch(err => {
          this.set(IS_VALIDATING, false);
          return reject(err);
        });
    });
  }
};
