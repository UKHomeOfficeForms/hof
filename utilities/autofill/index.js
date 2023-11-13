/* eslint-disable consistent-return, node/no-deprecated-api */
'use strict';

const url = require('url');
const Inputs = require('./inputs');
const Promise = require('bluebird');
const $ = require('@wdio/globals')

const debug = require('debug')('hof:util:autofill');

const MAX_LOOPS = 3;

module.exports = browserVal => (target, input, opts) => {
  const options = opts || {};
  options.maxLoops = options.maxLoops || MAX_LOOPS;

  const getValue = Inputs(input);

  let last;
  let count = 0;

  function completeTextField(element, name) {
    const value = getValue(name, 'text');
    debug(`Filling field: ${name} with value: ${value}`);
    return browserVal
      .elementIdClear(element)
      .elementIdValue(element, value)
      .catch(() => {
        // any error here is *probably* because the field is hidden
        // ignore and hope for the best
      });
  }

  function completeFileField(element, name) {
    const value = getValue(name, 'file');
    if (value) {
      debug(`Uploading file: ${value}`);
      return browserVal.uploadFile(value)
        .then(response => {
          debug(`Uploaded file: ${value} - remote path ${response.value}`);
          return browserVal
            .addValue(`input[name="${name}"]`, response.value);
        });
    }
    debug(`No file specified for input ${name} - ignoring`);
  }

  function completeRadio(element, name) {
    const value = getValue(name, 'radio');
    if (!value) {
      return browserVal.elements(`input[type="radio"][name="${name}"]`)
        .then(radios => {
          debug(`Checking random radio: ${name}`);
          const index = 1 + Math.floor(Math.random() * (radios.value.length - 1));
          return browserVal.elementIdClick(radios.value[index].ELEMENT);
        });
    }
    return browserVal.elementIdAttribute(element, 'value')
      .then(val => {
        if (val.value === value) {
          debug(`Checking radio: ${name} with value: ${val.value}`);
          browserVal.elementIdClick(element);
        }
      });
  }

  function completeCheckbox(element, name) {
    const value = getValue(name, 'checkbox');
    return browserVal.elementIdAttribute(element, 'value')
      .then(val => browserVal.elementIdAttribute(element, 'checked')
        .then(checked => {
          if (value === null) {
            if (!checked.value) {
              debug(`Leaving checkbox: ${name} blank`);
              return;
            }
            debug(`Unchecking checkbox: ${name}`);
            return browserVal.elementIdClick(element);
          }
          if (!value && !checked.value) {
            debug(`Checking checkbox: ${name} with value: ${val.value}`);
            return browserVal.elementIdClick(element);
          } else if (value && value.indexOf(val.value) > -1 && !checked.value) {
            debug(`Checking checkbox: ${name} with value: ${val.value}`);
            return browserVal.elementIdClick(element);
          } else if (value && value.indexOf(val.value) === -1 && checked.value) {
            debug(`Unchecking checkbox: ${name} with value: ${val.value}`);
            return browserVal.elementIdClick(element);
          }
          debug(`Ignoring checkbox: ${name} with value: ${val.value} - looking for ${value}`);
        }));
  }

  function completeSelectElement(element, name) {
    const value = getValue(name, 'select');
    if (!value) {
      return browserVal.elementIdElements(element, 'option')
        .then(o => {
          const index = 1 + Math.floor(Math.random() * (o.value.length - 1));
          debug(`Selecting option: ${index} from select box: ${name}`);
          return browserVal.selectByIndex(`select[name="${name}"]`, index);
        });
    }
    debug(`Selecting options: ${value} from select box: ${name}`);
    return browserVal.selectByValue(`select[name="${name}"]`, value);
  }

  async function completeStep(path) {
    console.log("path====", path);
    return await $$('input')
      .then(fields => {
        console.log("fields == ",fields);
        console.log("fields.value.length == ",fields.length);
        console.log("fields.values == ",fields.values);
        debug(`Found ${fields.length} <input> elements`);
        return Promise.map(fields, field => {
          console.log("*******Inside Promise.map*****");
          console.log("fields == ",fields);
          console.log("field == ",field);
          //console.log("field.ELEMENT == ",field.$('elementId'));
          //browserVal.elementIdAttribute(field.ELEMENT, 'type')
          field.getAttribute('type')
          .then(type => {
            console.log("type == ",type);
            console.log("type.value==", type);
            //browserVal.elementIdAttribute(field.ELEMENT, 'name')
            field.getAttribute('name')
            .then(name => {
              console.log("name==", name);
              console.log("name.value==", name);
              if (type === 'radio') {
                return completeRadio(field.ELEMENT, name);
              } else if (type === 'checkbox') {
                return completeCheckbox(field.ELEMENT, name);
              } else if (type === 'file') {
                return completeFileField(field.ELEMENT, name);
              } else if (type === 'text') {
                return completeTextField(field.ELEMENT, name);
              }
              debug(`Ignoring field of type ${type}`);
            })})}, {concurrency: 1});
      })
      .$$('select')
      .then(fields => {

        debug(`Found ${fields.value.length} <select> elements`);
        return Promise.map(fields.value, field => browserVal.elementIdAttribute(field.ELEMENT, 'name')
          .then(name => completeSelectElement(field.ELEMENT, name.value)));
      })
      .$$('textarea')
      .then(fields => {
        debug(`Found ${fields.value.length} <textarea> elements`);
        return Promise.map(fields.value, field => browserVal.elementIdAttribute(field.ELEMENT, 'name')
          .then(name => completeTextField(field.ELEMENT, name.value)));
      })
      .then(() => {
        if (options.screenshots) {
          const screenshot = require('path').resolve(options.screenshots, 'hof-autofill.pre-submit.png');
          return browserVal.saveScreenshot(screenshot);
        }
      })
      .then(() => {
        debug('Submitting form');
        return browserVal.$('input[type="submit"]').click();
      })
      .then(() => browserVal.getUrl()
        .then(p => {
          const u = url.parse(p);
          debug(`New page is: ${u.path}`);
          if (u.path !== path) {
            debug(`Checking current path ${u.path} against last path ${last}`);
            if (last === u.path) {
              count++;
              debug(`Stuck on path ${u.path} for ${count} iterations`);
              if (count === options.maxLoops) {
                if (options.screenshots) {
                  const screenshot = require('path').resolve(options.screenshots, 'hof-autofill.debug.png');
                  return browserVal.saveScreenshot(screenshot)
                    .then(() => {
                      throw new Error(`Progress stuck at ${u.path} - screenshot saved to ${screenshot}`);
                    });
                }
                throw new Error(`Progress stuck at ${u.path}`);
              }
            } else {
              count = 0;
            }
            last = u.path;
            return completeStep(path);
          }
          debug(`Arrived at ${path}. Done.`);
        }))
      .catch(e => browserVal.getText('#content')
        .then(text => {
          debug('PAGE CONTENT >>>>>>');
          debug(text);
          debug('END PAGE CONTENT >>>>>>');
        })
        .catch(() => null)
        .then(() => {
          throw e;
        }));
  }
  return completeStep(target);
};
