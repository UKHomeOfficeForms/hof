/* eslint-disable node/no-deprecated-api, no-param-reassign */
'use strict';

const _ = require('lodash');
// const request = require('request');
const axios = require('axios').default;
const url = require('url');
const EventEmitter = require('events').EventEmitter;

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
    // this._request = request;
  }

  save(options, callback) {
    // console.log("*******Save*******");
    if (typeof options === 'function' && arguments.length === 1) {
      callback = options;
      options = {};
    } else if (!options) {
      options = {};
    }

    return this.prepare().then(data => {
      data = JSON.stringify(data);
      const reqConf = this.requestConfig(options);
      reqConf.method = options.method || 'POST';

      reqConf.headers = Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }, reqConf.headers || {});
      // console.log("*******Save2*******");
      return this.request(reqConf, data, callback);
    });
  }

  fetch(options, callback) {
    if (typeof options === 'function' && arguments.length === 1) {
      callback = options;
      options = {};
    } else if (!options) {
      options = {};
    }
    const reqConf = this.requestConfig(options);
    reqConf.method = options.method || 'GET';
    return this.request(reqConf, callback);
  }

  delete(options, callback) {
    if (typeof options === 'function' && arguments.length === 1) {
      callback = options;
      options = {};
    } else if (!options) {
      options = {};
    }
    const reqConf = this.requestConfig(options);
    reqConf.method = options.method || 'DELETE';
    return this.request(reqConf, callback);
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

  request(originalSettings, body, callback) {
    console.log('*******Save3*******');
    if (typeof body === 'function' && arguments.length === 2) {
      callback = body;
      body = undefined;
    }

    let settings = Object.assign({}, originalSettings);
    settings.timeout = settings.timeout || this.options.timeout || 8000;
    settings.url = settings.uri || settings.url || url.format(settings);
    settings.baseUrl = `${settings.protocol}//${settings.host}`;
    //settings.url = settings.pathname || settings.path;
    settings.data = settings.body || body || settings.data;
    console.log('settings 55555 : ', settings);
    settings = _.omit(settings, urlKeys);
    this.emit('sync', originalSettings);

    const promise = Promise.resolve().then(() => this.auth()).then(authData => {
      console.log('*******Save4*******');
      settings.auth = authData;
      if (typeof settings.auth === 'string') {
        const auth = settings.auth.split(':');
        settings.auth = {
          user: auth.shift(),
          pass: auth.join(':'),
          sendImmediately: true
        };
      }
    })
      .then(() => {
         console.log("*******Save5*******");
        const startTime = process.hrtime();
        let timeoutTimer;

        return new Promise((resolve, reject) => {
           console.log("*******Save6*******");
           const _callback = (err, data, statusCode) => {
           //console.log("*******Save6-err*******", err);
           //console.log("*******Save6-data*******",data);
           //console.log("*******Save6-statusCode*******",statusCode);
            if (timeoutTimer) {
              clearTimeout(timeoutTimer);
              timeoutTimer = null;
            }

            const endTime = process.hrtime();
            const responseTime = timeDiff(startTime, endTime);
             console.log("*******Save10*******");
            if (err) {
               console.log("*******Save11*******");
               //console.log("*******err*******", err);
              this.emit('fail', err, data, originalSettings, statusCode, responseTime);
            } else {
               console.log("*******Save12*******");
              this.emit('success', data, originalSettings, statusCode, responseTime);
            }
            if (err) {
               console.log("*******Save13*******");
              reject(err);
            } else {
               console.log("*******Save14*******");
              resolve(data);
            }
          };


          /* console.log("*******Save8*******");
          console.log("settings: ", settings);
          this._request(settings, (err, response) => {
            console.log("*******Save9*******");
            if (err) {
              if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                err.message = 'Connection timed out';
                err.status = 504;
              }
              err.status = err.status || (response && response.statusCode) || 503;
              return _callback(err, null, err.status);
            }
            return this.handleResponse(response, (error, data, status) => {
              console.log("*****Response******");
              if (error) {
                error.headers = response.headers;
              }
              _callback(error, data, status);
            });
          });
*/

          // console.log('*******Save8*******');
          // console.log("settings: ", settings);
          // settings = Object.assign({}, settings);
          //console.log("settings: ", settings);
          // console.log("axios.request: ", axios.request);
          // console.log("axios: ", axios);
          
          
          /*
          this._request.default.interceptors.request.use(
            config => {
                  delete config.headers;
                  return config;
              },
              error => {
                  return Promise.reject(error);
              }
          );
          
*/


          this._request(settings)
            .then(response => {
             console.log("*******Save9*******");
              return this.handleResponse(response, (error, data, status) => {
                //console.log("*******Save9-err*******", error);
                //console.log("*******Save9-data*******", data);
                //console.log("*******Save9-status*******", status);
                // console.log("*****Response******");
                if (error) {
                  console.log("*******Save9-response.headers*******", response.headers);
                  error.headers = response.headers;
                }
                _callback(error, data, status);
              });
            }).catch(err => {
             console.log("*****Error******");
              if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                err.message = 'Connection timed out';
                err.status = 504;
              }
              err.status = err.status || 503;
               //console.log("Error:: ", err);
              // console.log("Error Status::", err.status);
              return _callback(err, null, err.status);
            });
            
/*
         settings = Object.assign({}, settings, {url: settings.uri});
         try{
          let response = this._request(settings);
          console.log("*******Save9*******");
          return this.handleResponse(response.data, (error, data, status) => {
          // console.log("*****Response******");
            if (error) {
              error.headers = response.headers;
            }
            _callback(error, data, status);
          });
         } catch(err) {
          if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
            err.message = 'Connection timed out';
            err.status = 504;
          }
          err.status = err.status || 503;
           console.log("Error:: ", err);
           console.log("Error Status::", err.status);
          return _callback(err, null, err.status);
        }
*/

        });
      });

    if (typeof callback === 'function') {
      return promise.then(data => callback(null, data), callback);
    }
    return promise;
  }

  handleResponse(response, callback) {
    console.log("*****HandleResponse******");
    let data = {};
    try {
      data = JSON.parse(response.data || '{}');
      console.log("*****HandleResponse - 1******");
     // console.log('Data:: ', data);
    } catch (err) {
      err.status = response.statusCode;
      err.body = response.data;
      //console.log('err.status:: ', err.status);
      //console.log('err.body:: ', err.body);
      console.log("*****HandleResponse - 2******");
      return callback(err, null, response.statusCode);
    }
   // console.log("response.statusCode ::", response.statusCode);
    return this.parseResponse(response.statusCode, data, callback);
  }

  parseResponse(statusCode, data, callback) {
    if (statusCode < 400) {
      console.log('*******parseResponse*******');
      try {
        data = this.parse(data);
        //console.log('Data::', data);
        callback(null, data, statusCode);
      } catch (err) {
        //console.log('err::', err);
        //console.log('statusCode:', statusCode);
        callback(err, null, statusCode);
      }
    } else {
      callback(this.parseError(statusCode, data), data, statusCode);
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
