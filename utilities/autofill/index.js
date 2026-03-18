/* eslint-disable consistent-return, node/no-deprecated-api */
'use strict';

const url = require('url');
const Inputs = require('./inputs');

const debug = require('debug')('hof:util:autofill');

const MAX_LOOPS = 3;

function getRemoteFilePath(uploadResult) {
  if (uploadResult && typeof uploadResult === 'object' && uploadResult.value) {
    return uploadResult.value;
  }

  return uploadResult;
}

module.exports = browser => async (target, input, opts) => {
  const options = opts || {};
  options.maxLoops = options.maxLoops || MAX_LOOPS;
  const getValue = Inputs(input);
  let last;
  let count = 0;

  async function completeTextField(element, name) {
    const value = getValue(name, 'text');
    debug(`Filling field: ${name} with value: ${value}`);
    try {
      await element.clearValue();
      await element.setValue(value);
    } catch (e) {
      // any error here is *probably* because the field is hidden
      // ignore and hope for the best
    }
  }

  async function completeFileField(element, name) {
    const value = getValue(name, 'file');
    if (value) {
      debug(`Uploading file: ${value}`);
      const remotePath = getRemoteFilePath(await browser.uploadFile(value));
      debug(`Uploaded file: ${value} - remote path ${remotePath}`);
      await element.setValue(remotePath);
    } else {
      debug(`No file specified for input ${name} - ignoring`);
    }
  }

  async function completeRadioGroup(name) {
    const value = getValue(name, 'radio');
    const radios = await browser.$$(`input[type="radio"][name="${name}"]`);

    if (!radios.length) {
      debug(`No radio inputs found for ${name}`);
      return;
    }

    if (!value) {
      debug(`Checking random radio: ${name}`);
      const index = Math.floor(Math.random() * radios.length);
      if (!await radios[index].isSelected()) {
        await radios[index].click();
      }
    } else {
      for (const radio of radios) {
        const val = await radio.getAttribute('value');
        if (val === value) {
          debug(`Checking radio: ${name} with value: ${val}`);
          if (!await radio.isSelected()) {
            await radio.click();
          }
          return;
        }
      }

      debug(`Ignoring radio group: ${name} - no option matches ${value}`);
    }
  }

  async function completeCheckbox(element, name) {
    const value = getValue(name, 'checkbox');
    const val = await element.getAttribute('value');
    const checked = await element.isSelected();
    if (value === null) {
      if (!checked) {
        debug(`Leaving checkbox: ${name} blank`);
        return;
      }
      debug(`Unchecking checkbox: ${name}`);
      await element.click();
    } else if (!value && !checked) {
      debug(`Checking checkbox: ${name} with value: ${val}`);
      await element.click();
    } else if (value && value.indexOf(val) > -1 && !checked) {
      debug(`Checking checkbox: ${name} with value: ${val}`);
      await element.click();
    } else if (value && value.indexOf(val) === -1 && checked) {
      debug(`Unchecking checkbox: ${name} with value: ${val}`);
      await element.click();
    } else {
      debug(`Ignoring checkbox: ${name} with value: ${val} - looking for ${value}`);
    }
  }

  async function completeSelectElement(element, name) {
    const value = getValue(name, 'select');
    if (!value) {
      const selectOptions = await element.$$('option');
      if (selectOptions.length > 1) {
        const index = 1 + Math.floor(Math.random() * (selectOptions.length - 1));
        debug(`Selecting option: ${index} from select box: ${name}`);
        await element.selectByIndex(index);
      }
    } else {
      debug(`Selecting options: ${value} from select box: ${name}`);
      await element.selectByAttribute('value', value);
    }
  }

  async function completeStep(path) {
    const completedRadioGroups = new Set();

    // Fill inputs
    const inputs = await browser.$$('input');
    debug(`Found ${inputs.length} <input> elements`);
    for (const element of inputs) {
      const type = await element.getAttribute('type');
      const name = await element.getAttribute('name');
      if (type === 'radio') {
        if (!completedRadioGroups.has(name)) {
          completedRadioGroups.add(name);
          await completeRadioGroup(name);
        }
      } else if (type === 'checkbox') {
        await completeCheckbox(element, name);
      } else if (type === 'file') {
        await completeFileField(element, name);
      } else if (type === 'text') {
        await completeTextField(element, name);
      } else {
        debug(`Ignoring field of type ${type}`);
      }
    }

    // Fill selects
    const selects = await browser.$$('select');
    debug(`Found ${selects.length} <select> elements`);
    for (const element of selects) {
      const name = await element.getAttribute('name');
      await completeSelectElement(element, name);
    }

    // Fill textareas
    const textareas = await browser.$$('textarea');
    debug(`Found ${textareas.length} <textarea> elements`);
    for (const element of textareas) {
      const name = await element.getAttribute('name');
      await completeTextField(element, name);
    }

    if (options.screenshots) {
      const screenshot = path.resolve(options.screenshots, 'hof-autofill.pre-submit.png');
      await browser.saveScreenshot(screenshot);
    }

    debug('Submitting form');
    const submitBtn = await browser.$('input[type="submit"], button[type="submit"]');
    if (!await submitBtn.isExisting()) {
      throw new Error('No submit control found on page');
    }
    await submitBtn.click();

    const p = await browser.getUrl();
    const u = url.parse(p);
    debug(`New page is: ${u.path}`);
    if (u.path !== path) {
      debug(`Checking current path ${u.path} against last path ${last}`);
      if (last === u.path) {
        count++;
        debug(`Stuck on path ${u.path} for ${count} iterations`);
        if (count === options.maxLoops) {
          if (options.screenshots) {
            const screenshot = path.resolve(options.screenshots, 'hof-autofill.debug.png');
            await browser.saveScreenshot(screenshot);
            throw new Error(`Progress stuck at ${u.path} - screenshot saved to ${screenshot}`);
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
  }

  try {
    await completeStep(target);
  } catch (e) {
    try {
      const content = await browser.$('#content');
      const text = await content.getText();
      debug('PAGE CONTENT >>>>>>');
      debug(text);
      debug('END PAGE CONTENT >>>>>>');
    } catch (err) {
      // ignore error
    }
    throw e;
  }
};
