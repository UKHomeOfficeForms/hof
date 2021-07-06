var characterCount = require('../../../../frontend/toolkit/assets/javascript/character-count');
var util = require('../lib/util');
var $ = require('jquery');

describe('character-count', function () {
  beforeEach(function () {
    $('#test-container').append($('<form />'));
  });

  it('exports a function', function () {
    characterCount.should.be.a('function');
  });

  describe('initialisation', function () {
    beforeEach(function () {
      $('form').append($('<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="50"></textarea><span id="test-maxlength-hint" class="form-hint">50 maximum characters</span></div>'));
    });

    it('should change the static character count message if the textarea has a maxlength', function () {
      characterCount();
      $('#test-maxlength-hint').text().should.have.string('You have 50 characters remaining');
    });

    it('should remove the maxlength attribute from the textarea', function () {
      characterCount();
      $('#test').should.not.have.property('maxlength');
    });
  });

  describe('update on input', function () {
    beforeEach(function () {
      // textarea with 10 maximum characters
      $('form').append($('<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="10"></textarea><span id="test-maxlength-hint" class="form-hint">10 maximum characters</span></div>'));
      characterCount();
    });

    it('should have a live character count', function () {
      $('#test').val('hello');
      util.triggerEvent(document.getElementById('test'), 'input');
      $('#test-maxlength-hint').text().should.have.string('You have 5 characters remaining');
    });

    it('should change the suffix to `too many` when there are too many characters', function () {
      $('#test').val('tooManyChars');
      util.triggerEvent(document.getElementById('test'), 'input');
      $('#test-maxlength-hint').text().should.have.string('You have 2 characters too many');
    });

    it('should change `characters` to `character` when there is one character remaining or too many', function () {
      $('#test').val('nineChars');
      util.triggerEvent(document.getElementById('test'), 'input');
      $('#test-maxlength-hint').text().should.have.string('You have 1 character remaining');
    });

    it('should add the error class when user goes over the character limit and revert to the non-error class when the user goes back into the limit', function () {
      // first go over limit and assert it has error class
      $('#test').val('tooManyChars');
      util.triggerEvent(document.getElementById('test'), 'input');
      $('#test').hasClass('textarea-error').should.be.true;
      $('#test-maxlength-hint').hasClass('error-message').should.be.true;
      $('#test-maxlength-hint').hasClass('form-hint').should.be.false;

      // go back into limit and assert it has removed error class
      $('#test').val('nineChars');
      util.triggerEvent(document.getElementById('test'), 'input');
      $('#test').hasClass('textarea-error').should.be.false;
      $('#test-maxlength-hint').hasClass('form-hint').should.be.true;
      $('#test-maxlength-hint').hasClass('error-messsage').should.be.false;
    });
  });

  describe('high character counts', function () {
    beforeEach(function () {
      $('form').append($('<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="2000"></textarea><span id="test-maxlength-hint" class="form-hint">2000 maximum characters</span></div>'));
      characterCount();
    });

    it('should insert commas when character count is 1000 or more, so screen readers do not read the number as a year', function () {
      $('#test-maxlength-hint').text().should.have.string('You have 2,000 characters remaining');
    });
  });

  describe('update on timer for assistive technologies', function () {
    beforeEach(function () {
      $('form').append($('<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="10"></textarea><span id="test-maxlength-hint" class="form-hint">10 maximum characters</span></div>'));
      characterCount();
    });

    it('should update the hint message even when the value is directly edited without an input event', function (done) {
      $('#test').val('nineChars');
      $('#test').focus();
      setTimeout(function () {
        $('#test-maxlength-hint').text().should.have.string('You have 1 character remaining');
        done();
      }, 1100);
    });

    it('should not update the hint message if the value is the same length and there have been no input events', function () {
      $('#test').focus();
      setTimeout(function () {
        $('#test-maxlength-hint').text().should.have.string('You have 10 characters remaining');
        done();
      }, 1100);
    });
  });

  describe('multiple textareas', function () {
    beforeEach(function () {
      $('form').append($('<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="10"></textarea><span id="test-maxlength-hint" class="form-hint">10 maximum characters</span></div>'));
      $('form').append($('<div id="test2-group"><textarea name="test2" id="test2" class="maxlength" maxlength="10"></textarea><span id="test2-maxlength-hint" class="form-hint">10 maximum characters</span></div>'));
      characterCount();
    });

    it('should only update the hint of the textarea that has been updated', function () {
      $('#test').val('nineChars');
      util.triggerEvent(document.getElementById('test'), 'input');
      $('#test-maxlength-hint').text().should.have.string('You have 1 character remaining');
      $('#test2-maxlength-hint').text().should.have.string('You have 10 characters remaining');
    });

    it('should update both hints when both textareas have been updated', function () {
      $('#test').val('nineChars');
      $('#test2').val('sixCha');
      util.triggerEvent(document.getElementById('test'), 'input');
      util.triggerEvent(document.getElementById('test2'), 'input');
      $('#test-maxlength-hint').text().should.have.string('You have 1 character remaining');
      $('#test2-maxlength-hint').text().should.have.string('You have 4 characters remaining');
    });
  });
});
