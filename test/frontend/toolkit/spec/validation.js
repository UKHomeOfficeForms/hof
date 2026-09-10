/* eslint-disable max-len */
const validation = require('../../../../frontend/toolkit/assets/javascript/validation');
const util = require('../lib/util');

describe('Validation', function () {
  beforeEach(function () {
    document.getElementById('test-container').insertAdjacentHTML('beforeend', '<div id="content" />');
  });

  it('exports a function', function () {
    expect(typeof validation).toBe('function');
  });

  describe('summary', function () {
    beforeEach(function () {
      document.getElementById('content').insertAdjacentHTML('beforeend', '<div class="validation-summary" tabindex="-1">');
      validation();
    });

    it('adds focus to the validation summary', function () {
      expect(document.activeElement).toBe(document.getElementsByClassName('validation-summary')[0]);
    });
  });

  describe('form error groups', function () {
    beforeEach(function () {
      document.getElementById('content').insertAdjacentHTML('beforeend', '<div class="validation-summary" tabindex="-1">');
      document.getElementsByClassName('validation-summary')[0].insertAdjacentHTML('beforeend', '<ul><li><a id="error" href="#input-group">Error</a></li></ul>');
      document.getElementById('content').insertAdjacentHTML('beforeend', '<div id="input-group">');
    });

    describe('input element', function () {
      beforeEach(function () {
        document.getElementById('input-group').insertAdjacentHTML('beforeend', '<input type="text">');
        validation();
      });

      it('adds focus to the first input', function () {
        util.triggerEvent(document.getElementById('error'), 'click');
        expect(document.activeElement).toBe(document.getElementsByTagName('input')[0]);
      });
    });

    describe('textarea element', function () {
      beforeEach(function () {
        document.getElementById('input-group').appendChild(document.createElement('textarea'));
        validation();
      });

      it('adds focus to the first textarea', function () {
        util.triggerEvent(document.getElementById('error'), 'click');
        expect(document.activeElement).toBe(document.getElementsByTagName('textarea')[0]);
      });
    });

    describe('select element', function () {
      beforeEach(function () {
        document.getElementById('input-group').appendChild(document.createElement('select'));
        validation();
      });

      it('adds focus to the first select box', function () {
        util.triggerEvent(document.getElementById('error'), 'click');
        expect(document.activeElement).toBe(document.getElementsByTagName('select')[0]);
      });
    });
  });
});
