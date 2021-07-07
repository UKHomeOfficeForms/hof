/* eslint-disable no-var, func-names, no-param-reassign */
module.exports = {
  triggerEvent: function triggerEvent(element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
  },

  triggerKeyboardEvent: function triggerKeyboardEvent(element, event, options) {
    var evt = document.createEvent('Event');
    options = options || {};
    evt.initEvent(event, true, true);
    Object.assign(evt, options);
    element.dispatchEvent(evt);
  }
};
