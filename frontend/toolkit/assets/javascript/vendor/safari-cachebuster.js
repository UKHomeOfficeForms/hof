/* eslint-disable no-var */
window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};
