
'use strict';
const config = require('../../config/hof-defaults');

module.exports = superclass => class extends superclass {
  configure(req, res, next) {
    // reset the session if user chooses to exit on session timeout warning
    if (req.form.options.route === '/exit') {
      req.sessionModel.reset();
    }
    return super.configure(req, res, next);
  }

  locals(req, res) {
    // set the custom session dialog message
    const superLocals = super.locals(req, res);
    if (res.locals.sessionTimeoutWarningContent === true) {
      superLocals.dialogTitle = true;
      superLocals.dialogText = true;
      superLocals.timeoutContinueButton = true;
      superLocals.dialogExitLink = true;
    }

    // set the content on /exit page
    if (req.form.options.route === '/exit' && config.exitFormContent === true) {
      superLocals.exitFormContent = true;
      return superLocals;
    } else if (req.form.options.route === '/exit' && config.exitFormContent === false) {
      superLocals.header = req.translate('exit.header');
      superLocals.title = req.translate('exit.title');
      superLocals.message = req.translate('exit.message');
      return superLocals;
    }
    return superLocals;
  }
};
