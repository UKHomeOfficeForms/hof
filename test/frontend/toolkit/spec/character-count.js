/* eslint-disable max-len */
const characterCount = require('../../../../frontend/toolkit/assets/javascript/character-count');
const util = require('../lib/util');

describe('character-count', function () {
  beforeEach(function () {
    document.getElementById('test-container').appendChild(document.createElement('form'));
  });

  it('exports a function', function () {
    expect(typeof characterCount).toBe('function');
  });

  describe('initialisation', function () {
    beforeEach(function () {
      document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="50"></textarea><div id="test-maxlength-hint" class="govuk-hint">50 maximum characters</div></div>');
    });

    it('should change the static character count message if the textarea has a maxlength', function () {
      characterCount();
      expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 50 characters remaining');
    });

    it('should remove the maxlength attribute from the textarea', function () {
      characterCount();
      expect(document.getElementById('test')).not.toHaveProperty('maxlength');
    });
  });

  describe('update on input', function () {
    beforeEach(function () {
      // textarea with 10 maximum characters
      document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="10"></textarea><div id="test-maxlength-hint" class="govuk-hint">10 maximum characters</div></div>');
      characterCount();
    });

    it('should have a live character count', function () {
      document.getElementById('test').value = 'hello';
      util.triggerEvent(document.getElementById('test'), 'input');
      expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 5 characters remaining');
    });

    it('should change the suffix to `too many` when there are too many characters', function () {
      document.getElementById('test').value = 'tooManyChars';
      util.triggerEvent(document.getElementById('test'), 'input');
      expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 2 characters too many');
    });

    it('should change `characters` to `character` when there is one character remaining or too many', function () {
      document.getElementById('test').value = 'nineChars';
      util.triggerEvent(document.getElementById('test'), 'input');
      expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 1 character remaining');
    });

    it('should add the error class when user goes over the character limit and revert to the non-error class when the user goes back into the limit', function () {
      // first go over limit and assert it has error class
      document.getElementById('test').value = 'tooManyChars';
      util.triggerEvent(document.getElementById('test'), 'input');
      expect(document.getElementById('test').classList.contains('textarea-error')).toBe(true);
      expect(document.getElementById('test-maxlength-hint').classList.contains('govuk-error-message')).toBe(true);

      // go back into limit and assert it has removed error class
      document.getElementById('test').value = 'nineChars';
      util.triggerEvent(document.getElementById('test'), 'input');
      expect(document.getElementById('test').classList.contains('textarea-error')).toBe(false);
      expect(document.getElementById('test-maxlength-hint').classList.contains('govuk-error-message')).toBe(false);
    });
  });

  describe('high character counts', function () {
    beforeEach(function () {
      document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="2000"></textarea><div id="test-maxlength-hint" class="govuk-hint">2000 maximum characters</div></div>');
      characterCount();
    });

    it('should insert commas when character count is 1000 or more, so screen readers do not read the number as a year', function () {
      expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 2,000 characters remaining');
    });
  });

  describe('update on timer for assistive technologies', function () {
    beforeEach(function () {
      document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="10"></textarea><div id="test-maxlength-hint" class="govuk-hint">10 maximum characters</div></div>');
      characterCount();
    });

    it('should update the hint message even when the value is directly edited without an input event', function (done) {
      document.getElementById('test').value = 'nineChars';
      document.getElementById('test').focus();
      setTimeout(function () {
        expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 1 character remaining');
        done();
      }, 1100);
    });

    it('should not update the hint message if the value is the same length and there have been no input events', function () {
      document.getElementById('test').focus();
      setTimeout(function () {
        expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 10 characters remaining');
        done();
      }, 1100);
    });
  });

  describe('multiple textareas', function () {
    beforeEach(function () {
      const form = document.querySelector('form');
      form.insertAdjacentHTML('beforeend', '<div id="test-group"><textarea name="test" id="test" class="maxlength" maxlength="10"></textarea><div id="test-maxlength-hint" class="govuk-hint">10 maximum characters</div></div>');
      form.insertAdjacentHTML('beforeend', '<div id="test2-group"><textarea name="test2" id="test2" class="maxlength" maxlength="10"></textarea><div id="test2-maxlength-hint" class="govuk-hint">10 maximum characters</div></div>');
      characterCount();
    });

    it('should only update the hint of the textarea that has been updated', function () {
      document.getElementById('test').value = 'nineChars';
      util.triggerEvent(document.getElementById('test'), 'input');
      expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 1 character remaining');
      expect(document.getElementById('test2-maxlength-hint').textContent).toContain('You have 10 characters remaining');
    });

    it('should update both hints when both textareas have been updated', function () {
      document.getElementById('test').value = 'nineChars';
      document.getElementById('test2').value = 'sixCha';
      util.triggerEvent(document.getElementById('test'), 'input');
      util.triggerEvent(document.getElementById('test2'), 'input');
      expect(document.getElementById('test-maxlength-hint').textContent).toContain('You have 1 character remaining');
      expect(document.getElementById('test2-maxlength-hint').textContent).toContain('You have 4 characters remaining');
    });
  });
});
