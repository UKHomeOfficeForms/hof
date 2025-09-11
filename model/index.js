/* eslint-disable node/no-deprecated-api, no-param-reassign */
'use strict';

const _ = require('lodash');
const axios = require('axios').default;
const url = require('url');
const EventEmitter = require('events').EventEmitter;
const axiosSetting = require('./apis/axios-settings');
const REFERENCE = /^\$ref:/;

function timeDiff(from, to, d) {
  let digits = d;
  if (digits === undefined) {
    digits = 3;
  }
  const ms = (to[0] - from[0]) * 1e3 + (to[1] - from[1]) * 1e-6;
  return +ms.toFixed(digits);
}

const urlKeys = Object.keys(url.parse(''));

module.exports = class Model extends EventEmitter {
  constructor(attributes, options) {
    super(attributes, options);
    this.options = options || {};
    this.attributes = {};
    this.set(attributes, {
      silent: true
    });
    this._request = axios;
  }

  async save(options, callback) {
    if (typeof options === 'function' && arguments.length === 1) {
      callback = options;
      options = {};
    } else if (!options) {
      options = {};
    }

    let data = await this.prepare();
    data = JSON.stringify(data);
    const reqConf = this.requestConfig(options);
    reqConf.method = options.method || 'POST';
    reqConf.headers = Object.assign({
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }, reqConf.headers || {});
    return await this.request(reqConf, data, callback);
  }

  async fetch(options, callback) {
    if (typeof options === 'function' && arguments.length === 1) {
      callback = options;
      options = {};
    } else if (!options) {
      options = {};
    }
    const reqConf = this.requestConfig(options);
    reqConf.method = options.method || 'GET';
    return await this.request(reqConf, callback);
  }

  async delete(options, callback) {
    if (typeof options === 'function' && arguments.length === 1) {
      callback = options;
      options = {};
    } else if (!options) {
      options = {};
    }
    const reqConf = this.requestConfig(options);
    reqConf.method = options.method || 'DELETE';
    return await this.request(reqConf, callback);
  }

  requestConfig(options) {
    let reqConf = this.url(options);
    if (typeof reqConf === 'string') {
      reqConf = url.parse(reqConf);
    }
    return Object.assign(reqConf, {
      headers: options.headers || reqConf.headers || this.options.headers
    });
  }

  async request(originalSettings, body, callback) {
    if (typeof body === 'function' && arguments.length === 2) {
      callback = body;
      body = undefined;
    }

    let settings = Object.assign({}, originalSettings);
    settings.timeout = settings.timeout || this.options.timeout;
    settings = axiosSetting(settings, body);
    settings = _.omit(settings, urlKeys);
    this.emit('sync', originalSettings);

    try {
      const authData = await this.auth();
      let authVal = authData;
      if (typeof authVal === 'string') {
        const [user, ...rest] = authVal.split(':');
        authVal = {
          user,
          pass: rest.join(':'),
          sendImmediately: true
        };
      }
      if (authVal) {
        settings.headers = {
          ...settings.headers,
          Authorization: `Bearer ${authVal.bearer}`
        };
      }

      const startTime = process.hrtime();
      let timeoutTimer;

      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }

      const data = await new Promise((resolve, reject) => {
        const _callback = (err, responseData, statusCode) => {
          if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
          }

          const endTime = process.hrtime();
          const responseTime = timeDiff(startTime, endTime);
          if (err) {
            this.emit('fail', err, responseData, originalSettings, statusCode, responseTime);
            reject(err);
          } else {
            this.emit('success', responseData, originalSettings, statusCode, responseTime);
            resolve(responseData);
          }
        };

        this._request(settings)
          .then(response => {
            return this.handleResponse(response)
              .then(responseData => _callback(null, responseData, response.status))
              .catch(error => {
                error.headers = response.headers;
                _callback(error, null, response.status);
              });
          })
          .catch(err => {
            if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
              err.message = 'Connection timed out';
              err.status = 504;
            }
            err.status = err.status || 503;
            return _callback(err, null, err.status);
          });
      });

      if (typeof callback === 'function') {
        callback(null, data);
      }
      return data;
    } catch (error) {
      if (typeof callback === 'function') {
        callback(error);
      }
      throw error;
    }
  }

  async handleResponse(response) {
    let data = null;
    try {
      if (typeof response.data === 'object') {
        data = response.data;
      } else if (typeof response.data === 'string' && response.data.trim() !== '') {
        data = JSON.parse(response.data);
      } else {
        data = {};
      }
    } catch (err) {
      err.message = 'Failed to parse response data';
      err.status = response.status;
      err.body = response.data;
      throw err;
    }
    return await this.parseResponse(response.status, data);
  }

  async parseResponse(statusCode, data) {
    if (statusCode < 400) {
      try {
        data = await this.parse(data);
        return data;
      } catch (err) {
        throw err;
      }
    } else {
      throw this.parseError(statusCode, data);
    }
  }

  prepare() {
    return Promise.resolve(this.toJSON());
  }

  parse(data) {
    return data;
  }

  parseError(statusCode, data) {
    return Object.assign({
      status: statusCode
    }, data);
  }

  resolveReference(value, map) {
    if (typeof value === 'string' && value.match(REFERENCE)) {
      const key = value.replace(REFERENCE, '');
      return _.cloneDeep(map[key]);
    }
    return value;
  }

  get(key) {
    const value = _.cloneDeep(this.attributes[key]);
    return this.resolveReference(value, this.attributes);
  }

  set(key, value, options) {
    let attrs = {};

    if (typeof key === 'string') {
      attrs[key] = value;
    } else {
      attrs = key;
      options = value;
    }
    options = options || {};

    const old = this.toJSON();
    const changed = _.pickBy(attrs, (attr, attrKey) => attr !== old[attrKey] || attr !== this.attributes[attrKey]);

    Object.assign(this.attributes, attrs);

    const references = _.reduce(this.attributes, (map, val, k) => {
      if (typeof val === 'string' && val.match(REFERENCE)) {
        const reffed = val.replace(REFERENCE, '');
        map[reffed] = map[reffed] || [];
        map[reffed].push(k);
      }
      return map;
    }, {});

    if (!options.silent && _.size(changed)) {
      _.each(changed, (changedValue, changedKey) => {
        this.emit(`change:${changedKey}`, this.get(changedKey), old[changedKey]);
        // emit change events for referenced fields
        if (references[changedKey]) {
          references[changedKey].forEach(k => {
            this.emit(`change:${k}`, this.get(changedKey), old[k]);
          });
        }
      });
      // add references to changed field map
      _.each(references, (fields, ref) => {
        fields.forEach(f => {
          changed[f] = changed[ref];
        });
      });
      this.emit('change', changed);
    }

    return this;
  }

  unset(fields, options) {
    options = options || {};
    if (typeof fields === 'string') {
      fields = [fields];
    }

    const old = this.toJSON();
    const changed = fields.reduce((obj, key) => {
      if (old[key] !== undefined) {
        obj[key] = undefined;
        delete this.attributes[key];
      }
      return obj;
    }, {});

    if (!options.silent && _.size(changed)) {
      _.each(changed, (value, key) => {
        this.emit('change:' + key, undefined, old[key]);
      });
      this.emit('change', changed);
    }

    return this;
  }

  increment(property, amount) {
    if (!property || typeof property !== 'string') {
      throw new Error('Trying to increment undefined property');
    }
    const val = this.get(property) || 0;
    amount = amount || 1;
    this.set(property, val + amount);
  }

  reset(options) {
    options = options || {};
    const keys = Object.keys(this.attributes);
    this.attributes = {};
    if (!options.silent) {
      _.each(keys, key => {
        this.emit('change:' + key, undefined);
      });
      this.emit('reset');
    }
  }

  url(options) {
    options = options || {};

    // falback to this.options.url
    options.url = options.url || this.options.url;

    let opts = {};
    if (options.url) {
      opts = url.parse(options.url);
    }
    // passing a host to url.format overrides other options, so remove it
    delete opts.host;
    Object.assign(opts, options);
    return url.format(opts);
  }

  auth() {
    return;
  }

  toJSON() {
    return _.mapValues(_.cloneDeep(this.attributes), (value, key, attrs) => this.resolveReference(value, attrs));
  }
};
