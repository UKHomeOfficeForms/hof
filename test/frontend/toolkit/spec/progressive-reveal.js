/* eslint-disable max-len */
const progressiveReveal = require('../../../../frontend/toolkit/assets/javascript/progressive-reveal');

const $ = require('jquery');

describe('Progressive Reveal', function () {
  it('exports a function', function () {
    expect(typeof progressiveReveal).toBe('function');
  });

  describe('checkbox', function () {
    beforeEach(function () {
      $('#test-container').append('<form />');
      $('form').append('<label for="check">');
      $('form').append('<div id="check-toggle" class="reveal govuk-checkboxes__conditional--hidden">');
    });

    describe('single', function () {
      beforeEach(function () {
        $('label').append('<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
        progressiveReveal();
      });

      it('show toggle content when checked', function () {
        $('#check').click();
        expect($('#check-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeFalsy();
      });

      it('hide toggle content when unchecked', function () {
        $('#check').click();
        $('#check').click();
        expect($('#check-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });
    });

    describe('with hidden text input', function () {
      beforeEach(function () {
        $('label').append('<input type="checkbox" id="check" name="check" aria-controls="textbox-panel">CheckBox');
        $('form').append('<div id="textbox-panel" class="reveal govuk-checkboxes__conditional--hidden" aria-hidden="true">');
        $('div').append('<input type="text" id="textbox">');
        progressiveReveal();
      });

      it('reveals text input', function () {
        $('#check').click();
        expect(($('#textbox-panel').attr('aria-hidden') === 'false')).toBeTruthy();
      });

      it('focuses on text input', function () {
        $('#check').click();
        expect((document.activeElement.id === 'textbox')).toBeTruthy;
      });
    });

    describe('with hidden textarea', function () { // todo
      beforeEach(function () {
        $('label').append('<input type="checkbox" id="check" name="check" aria-controls="textbox-panel">CheckBox');
        $('form').append('<div id="textbox-panel" class="reveal govuk-checkboxes__conditional--hidden" aria-hidden="true">');
        $('div').append('<textarea id="textbox">');
        progressiveReveal();
      });

      it('reveals text input', function () {
        $('#check').click();
        expect(($('#textbox-panel').attr('aria-hidden') === 'false')).toBeTruthy();
      });

      it('focuses on text input', function () {
        $('#check').click();
        expect((document.activeElement.id === 'textbox')).toBeTruthy();
      });
    });


    describe('parent panel', function () {
      beforeEach(function () {
        $('form').append('<div id="check-toggle-panel">');
        $('label').append('<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
        progressiveReveal();
      });

      it('should have added the govuk-checkboxes__conditional--hidden class', function () {
        expect($('#check-toggle-panel').hasClass('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });

      it('should show #check-toggle-panel if present', function () {
        $('#check').click();
        expect($('#check-toggle-panel').hasClass('govuk-checkboxes__conditional--hidden')).toBeFalsy();
      });

      it('should not show #show-toggle', function () {
        $('#check').click();
        expect($('#check-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });
    });

    describe('pre-selected', function () {
      beforeEach(function () {
        $('label').append('<input type="checkbox" id="check" name="check" data-toggle="check-toggle" checked>CheckBox');
        progressiveReveal();
      });

      it('show toggle content when checkbox is pre-selected', function () {
        expect($('#check-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeFalsy();
      });
    });

    describe('multiple checkbox', function () {
      beforeEach(function () {
        // first checkbox has toggle content
        $('label').append('<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
        // second checkbox has no toggle content
        $('form').append('<label for="check-other">');
        $('label[for=check-other]').append('<input type="checkbox" id="check-other" name="check-other">');
        // third checkbox has toggle content
        $('form').append('<label for="check-another">');
        $('label[for=check-another]').append('<input type="checkbox" id="check-another" name="check-another" data-toggle="check-another-toggle">');
        $('form').append('<div id="check-another-toggle" class="reveal govuk-checkboxes__conditional--hidden">');
        progressiveReveal();
      });

      it('only show toggle content for the particular checkbox', function () {
        $('#check').click();
        expect($('#check-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeFalsy();
        expect($('#check-another-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });

      it('do nothing when a checkbox is checked that doesn\'t have toggle content', function () {
        $('#check-other').click();
        expect($('#check-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeTruthy();
        expect($('#check-another-toggle').hasClass('govuk-checkboxes__conditional--hidden')).toBeTruthy();
      });
    });
  });

  describe('radio', function () {
    beforeEach(function () {
      $('#test-container').append('<form />');
      $('form').append('<label for="radio1">');
      $('form').append('<div id="radio1-toggle" class="reveal govuk-radios__conditional--hidden">');
    });

    describe('pre-selected', function () {
      beforeEach(function () {
        $('label').append('<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle" checked>Radio 1');
        progressiveReveal();
      });

      it('shows toggle content', function () {
        expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
      });
    });

    describe('clicked twice consecutively', function () {
      beforeEach(function () {
        $('label').append('<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle">');
        progressiveReveal();
      });

      it('make no change', function () {
        $('#radio1').click();
        expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
        $('#radio1').click();
        expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
      });
    });

    describe('radio groups', function () {
      beforeEach(function () {
        $('label').append('<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle">');
        $('form').append('<label for="radio2">');
        $('label[for=radio2]').append('<input type="radio" name="group1" id="radio2" data-toggle="radio2-toggle">');
        $('form').append('<div id="radio2-toggle" class="reveal govuk-radios__conditional--hidden">');
      });

      describe('with as many toggles as radios', function () {
        beforeEach(function () {
          progressiveReveal();
        });

        it('show content when checked', function () {
          $('#radio1').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('show new content and hide old content if another radio is checked', function () {
          $('#radio1').click();
          $('#radio2').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
        });
      });

      describe('with fewer toggles than radios and more than one group', function () {
        beforeEach(function () {
          // group 1
          $('form').append('<label for="radio3">');
          $('label[for=radio3]').append('<input type="radio" name="group1" id="radio3">');
          // group 2
          $('form').append('<label for="radio4">');
          $('label[for=radio4]').append('<input type="radio" name="group2" id="radio4" data-toggle="radio4-toggle">');
          $('form').append('<div id="radio4-toggle" class="reveal govuk-radios__conditional--hidden">');
          progressiveReveal();
        });

        it('show nothing if no associated toggle content', function () {
          $('#radio3').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('hide content if another radio is checked', function () {
          $('#radio1').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          $('#radio3').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('shouldn\'t interfere with other radio groups', function () {
          $('#radio1').click();
          $('#radio4').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          expect($('#radio4-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
        });
      });

      describe('multiple radios toggling the same id', function () {
        beforeEach(function () {
          $('form').append('<label for="radio3">');
          $('label[for=radio3]').append('<input type="radio" name="group1" id="radio3" data-toggle="radio1-toggle">');
          progressiveReveal();
        });

        it('show content when checked', function () {
          $('#radio1').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
        });

        it('show new content and hide old content if another radio is checked', function () {
          $('#radio1').click();
          $('#radio2').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
        });

        it('show content for all radios referencing that id', function () {
          $('#radio1').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();

          $('#radio2').click();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();

          $('#radio3').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();

          $('#radio1').click();
          expect($('#radio1-toggle').hasClass('govuk-radios__conditional--hidden')).toBeFalsy();
          expect($('#radio2-toggle').hasClass('govuk-radios__conditional--hidden')).toBeTruthy();
        });
      });
    });
  });
});
