var formFocus = require('../../../../frontend/toolkit/assets/javascript/form-focus'),
    util = require('../lib/util'),
    $ = require('jquery');

describe('form-focus', function () {

    var focussedClass = 'focused',
        selectedClass = 'selected';

    beforeEach(function () {
        $('#test-container').append($('<form />'));
    });

    it('exports a function', function () {
        formFocus.should.be.a('function');
    });

    describe('radio buttons', function () {

        beforeEach(function () {
            $('form').append($('<label for="radio-1" class="block-label"><input type="radio" id="radio-1" name="radios" value="true">Radio 1</label>'));
            $('form').append($('<label for="radio-2" class="block-label"><input type="radio" id="radio-2" name="radios" value="false">Radio 2</label>'));
            $('form').append($('<label for="radio-3" class="block-label"><input type="radio" id="radio-3" name="other-radios" value="true">Radio 3</label>'));
            $('form').append($('<label for="radio-4" class="block-label"><input type="radio" id="radio-4" name="other-radios" value="true" checked="true">Radio 4</label>'));
            formFocus();
        });

        it('apply focussed class to label when gain focus', function () {
            util.triggerEvent(document.getElementById('radio-1'), 'focus');
            $('#radio-1').parent().hasClass(focussedClass).should.be.true;
        });

        it('apply selected class to label when clicked', function () {
            // Have to explicity set the checked property before triggering event
            $('#radio-1').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-1'), 'click');
            $('#radio-1').parent().hasClass(selectedClass).should.be.true;
        });

        it('remove focussed class when focus lost', function () {
            util.triggerEvent(document.getElementById('radio-1'), 'focus');
            util.triggerEvent(document.getElementById('radio-1'), 'blur');
            $('#radio-1').parent().hasClass(focussedClass).should.be.false;
        });

        it('retain selected class when focus lost', function () {
            util.triggerEvent(document.getElementById('radio-1'), 'focus');
            $('#radio-1').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-1'), 'click');
            util.triggerEvent(document.getElementById('radio-1'), 'blur');
            $('#radio-1').parent().hasClass(selectedClass).should.be.true;
        });

        it('lose both focussed and selected classes when another radio button in the same group is clicked', function () {
            util.triggerEvent(document.getElementById('radio-1'), 'focus');
            $('#radio-1').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-1'), 'click');
            util.triggerEvent(document.getElementById('radio-1'), 'blur');
            util.triggerEvent(document.getElementById('radio-2'), 'focus');
            $('#radio-2').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-2'), 'click');
            $('#radio-1').parent().hasClass(focussedClass).should.be.false;
            $('#radio-1').parent().hasClass(selectedClass).should.be.false;
            $('#radio-2').parent().hasClass(focussedClass).should.be.true;
            $('#radio-2').parent().hasClass(selectedClass).should.be.true;
        });

        it('lose selected class when another radio button in the same group is clicked', function () {
            $('#radio-1').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-1'), 'click');
            $('#radio-2').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-2'), 'click');
            $('#radio-1').parent().hasClass(selectedClass).should.be.false;
            $('#radio-2').parent().hasClass(selectedClass).should.be.true;
        });

        it('keep selected class when a radio button in a different group is clicked', function () {
            $('#radio-1').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-1'), 'click');
            $('#radio-3').attr('checked', true);
            util.triggerEvent(document.getElementById('radio-3'), 'click');
            $('#radio-1').parent().hasClass(selectedClass).should.be.true;
            $('#radio-3').parent().hasClass(selectedClass).should.be.true;
        });

        it('apply a selected class when a radio button is pre-selected', function () {
            $('#radio-4').parent().hasClass(selectedClass).should.be.true;
        });

    });

    describe('check boxes', function () {

        beforeEach(function () {
            $('form').append($('<label for="checkbox-1" class="block-label"><input type="checkbox" id="checkbox-1" name="checkbox-1" value="checkbox-1">Checkbox 1</label>'));
            $('form').append($('<label for="checkbox-2" class="block-label"><input type="checkbox" id="checkbox-2" name="checkbox-2" value="checkbox-2">Checkbox 2</label>'));
            $('form').append($('<label for="checkbox-3" class="block-label"><input type="checkbox" id="checkbox-3" name="checkbox-3" value="checkbox-3" checked="true">Checkbox 3</label>'));
            formFocus();
        });

        it('apply focussed class to label when gain focus', function () {
            util.triggerEvent(document.getElementById('checkbox-1'), 'focus');
            $('#checkbox-1').parent().hasClass(focussedClass).should.be.true;
        });

        it('apply selected class to label when clicked', function () {
            // Have to explicity set the checked property before triggering event
            $('#checkbox-1').attr('checked', true);
            util.triggerEvent(document.getElementById('checkbox-1'), 'click');
            $('#checkbox-1').parent().hasClass(selectedClass).should.be.true;
        });

        it('remove focussed class when another checkbox is clicked', function () {
            util.triggerEvent(document.getElementById('checkbox-1'), 'focus');
            util.triggerEvent(document.getElementById('checkbox-1'), 'blur');
            util.triggerEvent(document.getElementById('checkbox-2'), 'focus');
            $('#checkbox-1').parent().hasClass(focussedClass).should.be.false;
        });

        it('apply a selected class when a check box is pre-selected', function () {
            $('#checkbox-3').parent().hasClass(selectedClass).should.be.true;
        });

    });

    describe('details', function () {

        beforeEach(function () {
            $('#test-container').append('<details />');
            $('details').append('<summary id="summary"><div>This is the summary</div></summary>');
            $('details').append('<div>Thesee are the extra details</div>');
            formFocus();
        });

        it('apply focussed class to details element when summary gains focus', function () {
            util.triggerEvent(document.getElementById('summary'), 'focus');
            $('details').hasClass(focussedClass).should.be.true;
        });

        it('remove focussed class from details element when summary loses focus', function () {
            util.triggerEvent(document.getElementById('summary'), 'focus');
            util.triggerEvent(document.getElementById('summary'), 'blur');
            $('details').hasClass(focussedClass).should.be.false;
        });

    });

});
