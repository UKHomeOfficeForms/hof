/**
 *
 * @fileOverview
 * Provides custom behavior for handling session timeout warnings and exit actions. This includes
 * - Resetting the session if the user exits due to a session timeout.
 * - Customizing the session timeout warning dialog content.
 * - Setting custom content and titles on the exit page.
 *
 * @module SessionTimeoutWarningBehavior
 * @requires ../../config/hof-defaults
 * @param {Class} superclass - The class to be extended.
 * @returns {Class} - The extended class with session timeout handling functionality.
 */

'use strict';
const config = require('../../config/hof-defaults');
const logger = require('../../lib/logger')(config);

module.exports = superclass => class extends superclass {
  configure(req, res, next) {
    try {
      // Reset the session if the user chooses to exit on session timeout warning
      if (req.form.options.route === '/exit') {
        req.sessionModel.reset();
        logger.log('info', 'Session has been reset on exit');
      }
      return super.configure(req, res, next);
    } catch (error) {
      logger.error('Error during session reset:', error);
      return next(error); // Pass the error to the next middleware for centralised handling
    }
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

    // set the content on /save-and-exit page
    if (req.form.options.route === '/save-and-exit' && config.saveExitFormContent === true) {
      superLocals.saveExitFormContent = true;
      return superLocals;
    } else if (req.form.options.route === '/save-and-exit' && config.saveExitFormContent === false) {
      superLocals.header = req.translate('save-and-exit.header');
      superLocals.title = req.translate('save-and-exit.title');
      superLocals.message = req.translate('save-and-exit.message');
      return superLocals;
    }
    return superLocals;
  }
};
