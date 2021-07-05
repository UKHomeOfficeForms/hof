var helpers = require('../../../../frontend').toolkit.helpers;

describe('Helpers', function () {

    describe('documentReady', function () {

        it('is a function', function () {
            helpers.documentReady.should.be.a('function');
        });

    });
    describe('addEvent', function () {

        it('is a function', function () {
            helpers.addEvent.should.be.a('function');
        });

    });
    describe('removeEvent', function () {

        it('is a function', function () {
            helpers.removeEvent.should.be.a('function');
        });

    });
    describe('target', function () {

        it('is a function', function () {
            helpers.target.should.be.a('function');
        });

    });
    describe('triggerEvent', function () {

        it('is a function', function () {
            helpers.triggerEvent.should.be.a('function');
        });

    });
    describe('preventDefault', function () {
        helpers.preventDefault.should.be.a('function');
    });
    describe('hasClass', function () {

        it('is a function', function () {
            helpers.hasClass.should.be.a('function');
        });

    });
    describe('addClass', function () {

        it('is a function', function () {
            helpers.addClass.should.be.a('function');
        });

    });
    describe('addClasses', function () {

        it('is a function', function () {
            helpers.addClasses.should.be.a('function');
        });

    });
    describe('stripClasses', function () {

        it('is a function', function () {
            helpers.stripClasses.should.be.a('function');
        });

    });
    describe('removeClass', function () {

        it('is a function', function () {
            helpers.removeClass.should.be.a('function');
        });

    });
    describe('getElementsByClass', function () {

        it('is a function', function () {
            helpers.getElementsByClass.should.be.a('function');
        });

    });
    describe('once', function () {

        it('stops callback being applied to the same element more than once', function () {

            var callback = sinon.stub();
            var elem = {};
            var fn = function () {
                helpers.once(elem, 'callback-name', callback);
            };
            fn();
            fn();
            fn();
            callback.should.have.been.calledOnce;
            callback.should.have.been.calledWithExactly(elem);
        });

        it('allows differently named callbacks to be applied on the same element', function () {
            var callback1 = sinon.stub();
            var callback2 = sinon.stub();
            var elem = {};
            var fn1 = function () {
                helpers.once(elem, 'callback-1', callback1);
            };
            var fn2 = function () {
                helpers.once(elem, 'callback-2', callback2);
            };
            fn1();
            fn2();
            fn1();
            fn2();
            callback1.should.have.been.calledOnce;
            callback1.should.have.been.calledWithExactly(elem);
            callback2.should.have.been.calledOnce;
            callback2.should.have.been.calledWithExactly(elem);
        });
    });
    describe('viewportWidth', function () {

        it('is a function', function () {
            helpers.viewportWidth.should.be.a('function');
        });

    });
    describe('scrollY', function () {

        it('is a function', function () {
            helpers.scrollY.should.be.a('function');
        });

    });
    describe('isDesktop', function () {

        it('is a function', function () {
            helpers.isDesktop.should.be.a('function');
        });

    });
    describe('getStyle', function () {

        it('is a function', function () {
            helpers.getStyle.should.be.a('function');
        });

    });

});
