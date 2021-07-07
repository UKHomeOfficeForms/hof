/* eslint-disable max-len, no-var */
var validation = require('../../../../frontend/toolkit/assets/javascript/validation');
var $ = require('jquery');
var util = require('../lib/util');

describe('Validation', function () {
  beforeEach(function () {
    $('#test-container').append('<div id="content" />');
  });

  it('exports a function', function () {
    validation.should.be.a('function');
  });

  describe('summary', function () {
    beforeEach(function () {
      $('#content').append('<div class="validation-summary" tabindex="-1">');
      validation();
    });

    it('adds focus to the validation summary', function () {
      document.activeElement.should.equal(document.getElementsByClassName('validation-summary')[0]);
    });
  });

  describe('form error groups', function () {
    beforeEach(function () {
      $('#content').append('<div class="validation-summary" tabindex="-1">');
      $('.validation-summary').append('<ul><li><a id="error" href="#input-group">Error</a></li></ul>');
      $('#content').append('<div id="input-group">');
    });

    describe('input element', function () {
      beforeEach(function () {
        $('#input-group').append('<input type="text">');
        validation();
      });

      it('adds focus to the first input', function () {
        util.triggerEvent(document.getElementById('error'), 'click');
        document.activeElement.should.equal(document.getElementsByTagName('input')[0]);
      });
    });

    describe('textarea element', function () {
      beforeEach(function () {
        $('#input-group').append('<textarea>');
        validation();
      });

      it('adds focus to the first textarea', function () {
        util.triggerEvent(document.getElementById('error'), 'click');
        document.activeElement.should.equal(document.getElementsByTagName('textarea')[0]);
      });
    });

    describe('select element', function () {
      beforeEach(function () {
        $('#input-group').append('<select>');
        validation();
      });

      it('adds focus to the first select box', function () {
        util.triggerEvent(document.getElementById('error'), 'click');
        document.activeElement.should.equal(document.getElementsByTagName('select')[0]);
      });
    });
  });
});
