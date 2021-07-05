var progressiveReveal = require('../../../../frontend').toolkit.progressiveReveal;

var $ = require('jquery');

describe('Progressive Reveal', function () {

    it('exports a function', function () {
        progressiveReveal.should.be.a('function');
    });

    describe('checkbox', function () {

        beforeEach(function () {
            $('#test-container').append('<form />');
            $('form').append('<label for="check">');
            $('form').append('<div id="check-toggle" class="reveal js-hidden">');
        });

        describe('single', function () {

            beforeEach(function () {
                $('label').append('<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
                progressiveReveal();
            });

            it('show toggle content when checked', function () {
                $('#check').click();
                $('#check-toggle').hasClass('js-hidden').should.not.be.ok;
            });

            it('hide toggle content when unchecked', function () {
                $('#check').click();
                $('#check').click();
                $('#check-toggle').hasClass('js-hidden').should.be.ok;
            });

        });

        describe('with hidden text input', function () {
            beforeEach(function () {
                $('label').append('<input type="checkbox" id="check" name="check" aria-controls="textbox-panel">CheckBox');
                $('form').append('<div id="textbox-panel" class="reveal js-hidden" aria-hidden="true">');
                $('div').append('<input type="text" id="textbox">');
                progressiveReveal();
            });

            it('reveals text input', function (){
                $('#check').click();
                ($('#textbox-panel').attr('aria-hidden') === 'false').should.be.ok;
            });

            it('focuses on text input', function (){
                $('#check').click();
                (document.activeElement.id === 'textbox').should.be.ok;
            });
        });

        describe('with hidden textarea', function () { // todo
            beforeEach(function () {
                $('label').append('<input type="checkbox" id="check" name="check" aria-controls="textbox-panel">CheckBox');
                $('form').append('<div id="textbox-panel" class="reveal js-hidden" aria-hidden="true">');
                $('div').append('<textarea id="textbox">');
                progressiveReveal();
            });

            it('reveals text input', function (){
                $('#check').click();
                ($('#textbox-panel').attr('aria-hidden') === 'false').should.be.ok;
            });

            it('focuses on text input', function (){
                $('#check').click();
                (document.activeElement.id === 'textbox').should.be.ok;
            });
        });


        describe('parent panel', function () {

            beforeEach(function () {
                $('form').append('<div id="check-toggle-panel">');
                $('label').append('<input type="checkbox" id="check" name="check" data-toggle="check-toggle">CheckBox');
                progressiveReveal();
            });

            it('should have added the js-hidden class', function () {
                $('#check-toggle-panel').hasClass('js-hidden').should.be.ok;
            });

            it('should show #check-toggle-panel if present', function () {
                $('#check').click();
                $('#check-toggle-panel').hasClass('js-hidden').should.not.be.ok;
            });

            it('should not show #show-toggle', function () {
                $('#check').click();
                $('#check-toggle').hasClass('js-hidden').should.be.ok;
            });
        });

        describe('pre-selected', function () {

            beforeEach(function () {
                $('label').append('<input type="checkbox" id="check" name="check" data-toggle="check-toggle" checked>CheckBox');
                progressiveReveal();
            });

            it('show toggle content when checkbox is pre-selected', function () {
                $('#check-toggle').hasClass('js-hidden').should.not.be.ok;
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
                $('form').append('<div id="check-another-toggle" class="reveal js-hidden">');
                progressiveReveal();
            });

            it('only show toggle content for the particular checkbox', function () {
                $('#check').click();
                $('#check-toggle').hasClass('js-hidden').should.not.be.ok;
                $('#check-another-toggle').hasClass('js-hidden').should.be.ok;
            });

            it('do nothing when a checkbox is checked that doesn\'t have toggle content', function () {
                $('#check-other').click();
                $('#check-toggle').hasClass('js-hidden').should.be.ok;
                $('#check-another-toggle').hasClass('js-hidden').should.be.ok;
            });

        });

    });

    describe('radio', function () {

        beforeEach(function () {
            $('#test-container').append('<form />');
            $('form').append('<label for="radio1">');
            $('form').append('<div id="radio1-toggle" class="reveal js-hidden">');
        });

        describe('pre-selected', function () {

            beforeEach(function () {
                $('label').append('<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle" checked>Radio 1');
                progressiveReveal();
            });

            it('shows toggle content', function () {
                $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
            });

        });

        describe('clicked twice consecutively', function () {

            beforeEach(function () {
                $('label').append('<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle">');
                progressiveReveal();
            });

            it('make no change', function () {
                $('#radio1').click();
                $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                $('#radio1').click();
                $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
            });

        });

        describe('radio groups', function () {

            beforeEach(function () {
                $('label').append('<input type="radio" name="group1" id="radio1" data-toggle="radio1-toggle">');
                $('form').append('<label for="radio2">');
                $('label[for=radio2]').append('<input type="radio" name="group1" id="radio2" data-toggle="radio2-toggle">');
                $('form').append('<div id="radio2-toggle" class="reveal js-hidden">');
            });

            describe('with as many toggles as radios', function () {

                beforeEach(function () {
                    progressiveReveal();
                });

                it('show content when checked', function () {
                    $('#radio1').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.be.ok;
                });

                it('show new content and hide old content if another radio is checked', function () {
                    $('#radio1').click();
                    $('#radio2').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.not.be.ok;
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
                    $('form').append('<div id="radio4-toggle" class="reveal js-hidden">');
                    progressiveReveal();
                });

                it('show nothing if no associated toggle content', function () {
                    $('#radio3').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.be.ok;
                });

                it('hide content if another radio is checked', function () {
                    $('#radio1').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio3').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.be.ok;
                });

                it('shouldn\'t interfere with other radio groups', function () {
                    $('#radio1').click();
                    $('#radio4').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio4-toggle').hasClass('js-hidden').should.not.be.ok;
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
                    $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.be.ok;
                });

                it('show new content and hide old content if another radio is checked', function () {
                    $('#radio1').click();
                    $('#radio2').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.not.be.ok;
                });

                it('show content for all radios referencing that id', function () {
                    $('#radio1').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.be.ok;

                    $('#radio2').click();
                    $('#radio2-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio1-toggle').hasClass('js-hidden').should.be.ok;

                    $('#radio3').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.be.ok;

                    $('#radio1').click();
                    $('#radio1-toggle').hasClass('js-hidden').should.not.be.ok;
                    $('#radio2-toggle').hasClass('js-hidden').should.be.ok;
                });
            });

        });

    });

});
