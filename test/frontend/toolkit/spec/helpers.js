/* eslint-disable max-len */
const helpers = require('../../../../frontend/toolkit/assets/javascript/helpers');

describe('Helpers', function () {
  describe('documentReady', function () {
    it('is a function', function () {
      expect(typeof helpers.documentReady).toBe('function');
    });
  });
  describe('addEvent', function () {
    it('is a function', function () {
      expect(typeof helpers.addEvent).toBe('function');
    });
  });
  describe('removeEvent', function () {
    it('is a function', function () {
      expect(typeof helpers.removeEvent).toBe('function');
    });
  });
  describe('target', function () {
    it('is a function', function () {
      expect(typeof helpers.target).toBe('function');
    });
  });
  describe('triggerEvent', function () {
    it('is a function', function () {
      expect(typeof helpers.triggerEvent).toBe('function');
    });
  });
  describe('preventDefault', function () {
    it('is a function', function () {
      expect(typeof helpers.preventDefault).toBe('function');
    });
  });
  describe('hasClass', function () {
    it('is a function', function () {
      expect(typeof helpers.hasClass).toBe('function');
    });
  });
  describe('addClass', function () {
    it('is a function', function () {
      expect(typeof helpers.addClass).toBe('function');
    });
  });
  describe('addClasses', function () {
    it('is a function', function () {
      expect(typeof helpers.addClasses).toBe('function');
    });
  });
  describe('stripClasses', function () {
    it('is a function', function () {
      expect(typeof helpers.stripClasses).toBe('function');
    });
  });
  describe('removeClass', function () {
    it('is a function', function () {
      expect(typeof helpers.removeClass).toBe('function');
    });
  });
  describe('getElementsByClass', function () {
    it('is a function', function () {
      expect(typeof helpers.getElementsByClass).toBe('function');
    });
  });
  describe('once', function () {
    it('stops callback being applied to the same element more than once', function () {
      let callNumber = 0;
      let callArg = null;
      const callback = function (arg) {
        callNumber++;
        callArg = arg;
      };
      const elem = {};
      const fn = function () {
        helpers.once(elem, 'callback-name', callback);
      };
      fn();
      fn();
      fn();
      expect(callNumber).toEqual(1);
      expect(callArg).toEqual(elem);
    });

    it('allows differently named callbacks to be applied on the same element', function () {
      let callNumber1 = 0;
      let callArg1 = null;
      const callback1 = function (arg) {
        callNumber1++;
        callArg1 = arg;
      };
      let callNumber2 = 0;
      let callArg2 = null;
      const callback2 = function (arg) {
        callNumber2++;
        callArg2 = arg;
      };
      const elem = {};
      const fn1 = function () {
        helpers.once(elem, 'callback-1', callback1);
      };
      const fn2 = function () {
        helpers.once(elem, 'callback-2', callback2);
      };
      fn1();
      fn2();
      fn1();
      fn2();
      expect(callNumber1).toEqual(1);
      expect(callArg1).toEqual(elem);
      expect(callNumber2).toEqual(1);
      expect(callArg2).toEqual(elem);
    });
  });
  describe('viewportWidth', function () {
    it('is a function', function () {
      expect(typeof helpers.viewportWidth).toBe('function');
    });
  });
  describe('scrollY', function () {
    it('is a function', function () {
      expect(typeof helpers.scrollY).toBe('function');
    });
  });
  describe('isDesktop', function () {
    it('is a function', function () {
      expect(typeof helpers.isDesktop).toBe('function');
    });
  });
  describe('getStyle', function () {
    it('is a function', function () {
      expect(typeof helpers.getStyle).toBe('function');
    });
  });
});
