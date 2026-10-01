/* eslint-disable max-len */
const formFocus = require('../../../../frontend/toolkit/assets/javascript/form-focus');
const util = require('../lib/util');

describe('form-focus', function () {
  const focussedClass = 'focused';
  const selectedClass = 'selected';

  beforeEach(function () {
    document.getElementById('test-container').appendChild(document.createElement('form'));
  });

  it('exports a function', function () {
    expect(typeof formFocus).toBe('function');
  });

  describe('radio buttons', function () {
    beforeEach(function () {
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio-1" class="block-label"><input type="radio" id="radio-1" name="radios" value="true">Radio 1</label>');
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio-2" class="block-label"><input type="radio" id="radio-2" name="radios" value="false">Radio 2</label>');
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio-3" class="block-label"><input type="radio" id="radio-3" name="other-radios" value="true">Radio 3</label>');
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio-4" class="block-label"><input type="radio" id="radio-4" name="other-radios" value="true" checked="true">Radio 4</label>');
      formFocus();
    });

    it('apply focussed class to label when gain focus', function () {
      util.triggerEvent(document.getElementById('radio-1'), 'focus');
      expect(document.getElementById('radio-1').parentElement.classList.contains(focussedClass)).toBe(true);
    });

    it('apply selected class to label when clicked', function () {
      // Have to explicity set the checked property before triggering event
      document.getElementById('radio-1').checked = true;
      util.triggerEvent(document.getElementById('radio-1'), 'click');
      expect(document.getElementById('radio-1').parentElement.classList.contains(selectedClass)).toBe(true);
    });

    it('remove focussed class when focus lost', function () {
      util.triggerEvent(document.getElementById('radio-1'), 'focus');
      util.triggerEvent(document.getElementById('radio-1'), 'blur');
      expect(document.getElementById('radio-1').parentElement.classList.contains(focussedClass)).toBe(false);
    });

    it('retain selected class when focus lost', function () {
      util.triggerEvent(document.getElementById('radio-1'), 'focus');
      document.getElementById('radio-1').checked = true;
      util.triggerEvent(document.getElementById('radio-1'), 'click');
      util.triggerEvent(document.getElementById('radio-1'), 'blur');
      expect(document.getElementById('radio-1').parentElement.classList.contains(selectedClass)).toBe(true);
    });

    it('lose both focussed and selected classes when another radio button in the same group is clicked', function () {
      util.triggerEvent(document.getElementById('radio-1'), 'focus');
      document.getElementById('radio-1').checked = true;
      util.triggerEvent(document.getElementById('radio-1'), 'click');
      util.triggerEvent(document.getElementById('radio-1'), 'blur');
      util.triggerEvent(document.getElementById('radio-2'), 'focus');
      document.getElementById('radio-2').checked = true;
      util.triggerEvent(document.getElementById('radio-2'), 'click');
      expect(document.getElementById('radio-1').parentElement.classList.contains(focussedClass)).toBe(false);
      expect(document.getElementById('radio-1').parentElement.classList.contains(selectedClass)).toBe(false);
      expect(document.getElementById('radio-2').parentElement.classList.contains(focussedClass)).toBe(true);
      expect(document.getElementById('radio-2').parentElement.classList.contains(selectedClass)).toBe(true);
    });

    it('lose selected class when another radio button in the same group is clicked', function () {
      document.getElementById('radio-1').checked = true;
      util.triggerEvent(document.getElementById('radio-1'), 'click');
      document.getElementById('radio-2').checked = true;
      util.triggerEvent(document.getElementById('radio-2'), 'click');
      expect(document.getElementById('radio-1').parentElement.classList.contains(selectedClass)).toBe(false);
      expect(document.getElementById('radio-2').parentElement.classList.contains(selectedClass)).toBe(true);
    });

    it('keep selected class when a radio button in a different group is clicked', function () {
      document.getElementById('radio-1').checked = true;
      util.triggerEvent(document.getElementById('radio-1'), 'click');
      document.getElementById('radio-3').checked = true;
      util.triggerEvent(document.getElementById('radio-3'), 'click');
      expect(document.getElementById('radio-1').parentElement.classList.contains(selectedClass)).toBe(true);
      expect(document.getElementById('radio-3').parentElement.classList.contains(selectedClass)).toBe(true);
    });

    it('apply a selected class when a radio button is pre-selected', function () {
      expect(document.getElementById('radio-4').parentElement.classList.contains(selectedClass)).toBe(true);
    });
  });

  describe('check boxes', function () {
    beforeEach(function () {
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="checkbox-1" class="block-label"><input type="checkbox" id="checkbox-1" name="checkbox-1" value="checkbox-1">Checkbox 1</label>');
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="checkbox-2" class="block-label"><input type="checkbox" id="checkbox-2" name="checkbox-2" value="checkbox-2">Checkbox 2</label>');
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="checkbox-3" class="block-label"><input type="checkbox" id="checkbox-3" name="checkbox-3" value="checkbox-3" checked="true">Checkbox 3</label>');
      formFocus();
    });

    it('apply focussed class to label when gain focus', function () {
      util.triggerEvent(document.getElementById('checkbox-1'), 'focus');
      expect(document.getElementById('checkbox-1').parentElement.classList.contains(focussedClass)).toBe(true);
    });

    it('apply selected class to label when clicked', function () {
      // Have to explicity set the checked property before triggering event
      document.getElementById('checkbox-1').checked = true;
      util.triggerEvent(document.getElementById('checkbox-1'), 'click');
      expect(document.getElementById('checkbox-1').parentElement.classList.contains(selectedClass)).toBe(true);
    });

    it('remove focussed class when another checkbox is clicked', function () {
      util.triggerEvent(document.getElementById('checkbox-1'), 'focus');
      util.triggerEvent(document.getElementById('checkbox-1'), 'blur');
      util.triggerEvent(document.getElementById('checkbox-2'), 'focus');
      expect(document.getElementById('checkbox-1').parentElement.classList.contains(focussedClass)).toBe(false);
    });

    it('apply a selected class when a check box is pre-selected', function () {
      expect(document.getElementById('checkbox-3').parentElement.classList.contains(selectedClass)).toBe(true);
    });
  });

  describe('details', function () {
    beforeEach(function () {
      document.getElementById('test-container').appendChild(document.createElement('details'));
      document.querySelector('details').insertAdjacentHTML('beforeend', '<summary id="summary"><div>This is the summary</div></summary>');
      document.querySelector('details').insertAdjacentHTML('beforeend', '<div>Thesee are the extra details</div>');
      formFocus();
    });

    it('apply focussed class to details element when summary gains focus', function () {
      util.triggerEvent(document.getElementById('summary'), 'focus');
      expect(document.querySelector('details').classList.contains(focussedClass)).toBe(true);
    });

    it('remove focussed class from details element when summary loses focus', function () {
      util.triggerEvent(document.getElementById('summary'), 'focus');
      util.triggerEvent(document.getElementById('summary'), 'blur');
      expect(document.querySelector('details').classList.contains(focussedClass)).toBe(false);
    });
  });
});
