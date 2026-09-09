/* eslint-disable max-len */
const progressiveReveal = require('../../../../frontend/toolkit/assets/javascript/progressive-reveal');

describe('Progressive Reveal', function () {
  it('exports a function', function () {
    expect(typeof progressiveReveal).toBe('function');
  });

  describe('checkbox', function () {
    beforeEach(function () {
      document.getElementById('test-container').appendChild(document.createElement('form'));
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="check">');
      document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="check-toggle" class="reveal govuk-checkboxes__conditional--hidden">');
    });

    describe('single', function () {
      beforeEach(function () {
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
        progressiveReveal();
      });

      it('show toggle content when checked', function () {
        document.getElementById('check').click();
        expect(document.getElementById('check-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeFalsy();
      });

      it('hide toggle content when unchecked', function () {
        document.getElementById('check').click();
        document.getElementById('check').click();
        expect(document.getElementById('check-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });
    });

    describe('with hidden text input', function () {
      beforeEach(function () {
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check" name="check" aria-controls="textbox-panel">CheckBox');
        document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="textbox-panel" class="reveal govuk-checkboxes__conditional--hidden" aria-hidden="true">');
        document.getElementById('textbox-panel').insertAdjacentHTML('beforeend', '<input type="text" id="textbox">');
        progressiveReveal();
      });

      it('reveals text input', function () {
        document.getElementById('check').click();
        expect(document.getElementById('textbox-panel').getAttribute('aria-hidden') === 'false').toBeTruthy();
      });

      it('focuses on text input', function () {
        document.getElementById('check').click();
        expect((document.activeElement.id === 'textbox')).toBeTruthy();
      });
    });

    describe('with hidden textarea', function () { // todo
      beforeEach(function () {
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check" name="check" aria-controls="textbox-panel">CheckBox');
        document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="textbox-panel" class="reveal govuk-checkboxes__conditional--hidden" aria-hidden="true">');
        document.getElementById('textbox-panel').insertAdjacentHTML('beforeend', '<textarea id="textbox">');
        progressiveReveal();
      });

      it('reveals text input', function () {
        document.getElementById('check').click();
        expect(document.getElementById('textbox-panel').getAttribute('aria-hidden') === 'false').toBeTruthy();
      });

      it('focuses on text input', function () {
        document.getElementById('check').click();
        expect((document.activeElement.id === 'textbox')).toBeTruthy();
      });
    });


    describe('parent panel', function () {
      beforeEach(function () {
        document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="check-toggle-panel">');
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
        progressiveReveal();
      });

      it('should have added the govuk-checkboxes__conditional--hidden class', function () {
        expect(document.getElementById('check-toggle-panel').classList.contains('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });

      it('should show #check-toggle-panel if present', function () {
        document.getElementById('check').click();
        expect(document.getElementById('check-toggle-panel').classList.contains('govuk-checkboxes__conditional--hidden')).toBeFalsy();
      });

      it('should not show #show-toggle', function () {
        document.getElementById('check').click();
        expect(document.getElementById('check-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });
    });

    describe('pre-selected', function () {
      beforeEach(function () {
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check" name="check" data-toggle="check-toggle" checked>CheckBox');
        progressiveReveal();
      });

      it('show toggle content when checkbox is pre-selected', function () {
        expect(document.getElementById('check-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeFalsy();
      });
    });

    describe('multiple checkbox', function () {
      beforeEach(function () {
        // first checkbox has toggle content
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
        // second checkbox has no toggle content
        document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="check-other">');
        document.querySelector('label[for=check-other]').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check-other" name="check-other">');
        // third checkbox has toggle content
        document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="check-another">');
        document.querySelector('label[for=check-another]').insertAdjacentHTML('beforeend', '<input type="checkbox" id="check-another" name="check-another" data-toggle="check-another-toggle">');
        document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="check-another-toggle" class="reveal govuk-checkboxes__conditional--hidden">');
        progressiveReveal();
      });

      it('only show toggle content for the particular checkbox', function () {
        document.getElementById('check').click();
        expect(document.getElementById('check-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeFalsy();
        expect(document.getElementById('check-another-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });

      it('do nothing when a checkbox is checked that doesn\'t have toggle content', function () {
        document.getElementById('check-other').click();
        expect(document.getElementById('check-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeTruthy();
        expect(document.getElementById('check-another-toggle').classList.contains('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });
    });
  });

  describe('radio', function () {
    beforeEach(function () {
      document.getElementById('test-container').appendChild(document.createElement('form'));
      document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio1">');
      document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="radio1-toggle" class="reveal govuk-radios__conditional--hidden">');
    });

    describe('pre-selected', function () {
      beforeEach(function () {
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle" checked>Radio 1');
        progressiveReveal();
      });

      it('shows toggle content', function () {
        expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
      });
    });

    describe('clicked twice consecutively', function () {
      beforeEach(function () {
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle">');
        progressiveReveal();
      });

      it('make no change', function () {
        document.getElementById('radio1').click();
        expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
        document.getElementById('radio1').click();
        expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
      });
    });

    describe('radio groups', function () {
      beforeEach(function () {
        document.querySelector('label').insertAdjacentHTML('beforeend', '<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle">');
        document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio2">');
        document.querySelector('label[for=radio2]').insertAdjacentHTML('beforeend', '<input type="radio" name="group1" id="radio2" data-toggle="radio2-toggle">');
        document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="radio2-toggle" class="reveal govuk-radios__conditional--hidden">');
      });

      describe('with as many toggles as radios', function () {
        beforeEach(function () {
          progressiveReveal();
        });

        it('show content when checked', function () {
          document.getElementById('radio1').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('show new content and hide old content if another radio is checked', function () {
          document.getElementById('radio1').click();
          document.getElementById('radio2').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
        });
      });

      describe('with fewer toggles than radios and more than one group', function () {
        beforeEach(function () {
          // group 1
          document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio3">');
          document.querySelector('label[for=radio3]').insertAdjacentHTML('beforeend', '<input type="radio" name="group1" id="radio3">');
          // group 2
          document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio4">');
          document.querySelector('label[for=radio4]').insertAdjacentHTML('beforeend', '<input type="radio" name="group2" id="radio4" data-toggle="radio4-toggle">');
          document.querySelector('form').insertAdjacentHTML('beforeend', '<div id="radio4-toggle" class="reveal govuk-radios__conditional--hidden">');
          progressiveReveal();
        });

        it('show nothing if no associated toggle content', function () {
          document.getElementById('radio3').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('hide content if another radio is checked', function () {
          document.getElementById('radio1').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          document.getElementById('radio3').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('shouldn\'t interfere with other radio groups', function () {
          document.getElementById('radio1').click();
          document.getElementById('radio4').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          expect(document.getElementById('radio4-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
        });
      });

      describe('multiple radios toggling the same id', function () {
        beforeEach(function () {
          document.querySelector('form').insertAdjacentHTML('beforeend', '<label for="radio3">');
          document.querySelector('label[for=radio3]').insertAdjacentHTML('beforeend', '<input type="radio" name="group1" id="radio3" data-toggle="radio1-toggle">');
          progressiveReveal();
        });

        it('show content when checked', function () {
          document.getElementById('radio1').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('show new content and hide old content if another radio is checked', function () {
          document.getElementById('radio1').click();
          document.getElementById('radio2').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
        });

        it('show content for all radios referencing that id', function () {
          document.getElementById('radio1').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();

          document.getElementById('radio2').click();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();

          document.getElementById('radio3').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();

          document.getElementById('radio1').click();
          expect(document.getElementById('radio1-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeFalsy();
          expect(document.getElementById('radio2-toggle').classList.contains('govuk-radios__conditional--hidden')).toBeTruthy();
        });
      });
    });
  });
});
