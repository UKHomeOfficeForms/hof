/* eslint-disable max-len, quotes */
'use strict';

const $ = require('jquery');
const fs = require('fs');
const path = require('path');
const sessionTimeoutWarningHtml = fs.readFileSync(path.resolve(__dirname, '../../../frontend/template-partials/views/partials/session-timeout-warning.html'), 'utf8');

jest.dontMock('fs');

describe('sessionDialog', () => {
  let sessionDialog;
  let $body;
  let $html;
  let options;
  let originalHTMLDialogElement;

  beforeAll(() => {
    // Set up the initial DOM structure needed for the tests
    document.body.innerHTML = `<div id='content'></div>` + sessionTimeoutWarningHtml.toString();
    window.GOVUK = {};
    require('../../../frontend/themes/gov-uk/client-js/session-timeout-dialog.js');
    sessionDialog = window.GOVUK.sessionDialog;
    $html = $('html');
    $body = $('body');
    options = {
      secondsSessionTimeout: 1800,
      secondsTimeoutWarning: 300
    };
    // Mock the showModal and close methods of the <dialog> element
    sessionDialog.el.showModal = jest.fn();
    sessionDialog.el.close = jest.fn();
    sessionDialog.$fallBackElement = { classList: { add: jest.fn() } };
    window.dialogPolyfill = { registerDialog: jest.fn() };
    originalHTMLDialogElement = HTMLDialogElement;
  });

  afterEach(() => {
    if (originalHTMLDialogElement !== undefined) {
      Object.defineProperty(window, 'HTMLDialogElement', {
        value: originalHTMLDialogElement,
        configurable: true
      });
    } else {
      delete window.HTMLDialogElement;
    }
    jest.clearAllMocks();
    $html.removeClass(sessionDialog.dialogIsOpenClass);
    $body.removeClass(sessionDialog.dialogIsOpenClass);
  });

  it('should initialize correctly', () => {
    const controller = jest.spyOn(sessionDialog, 'controller');
    sessionDialog.init(options);
    expect(sessionDialog.secondsSessionTimeout).toBe(1800);
    expect(sessionDialog.secondsTimeoutWarning).toBe(300);
    expect(sessionDialog.timeoutRedirectUrl).toBe('/session-timeout');
    expect(controller).toHaveBeenCalled();
  });

  it('should bind UI elements', () => {
    const spyOnBindUIElements = jest.spyOn(sessionDialog, 'bindUIElements');
    sessionDialog.init();
    expect(spyOnBindUIElements).toHaveBeenCalled();
  });

  it('should open the dialog', () => {
    sessionDialog.openDialog();
    expect($html.hasClass(sessionDialog.dialogIsOpenClass)).toBe(true);
    expect($body.hasClass(sessionDialog.dialogIsOpenClass)).toBe(true);
    expect(sessionDialog.el.showModal).toHaveBeenCalled();
  });

  it('should close the dialog', () => {
    sessionDialog.openDialog();
    expect(sessionDialog.isDialogOpen()).toBe(true);
    sessionDialog.closeDialog();
    expect($html.hasClass(sessionDialog.dialogIsOpenClass)).toBe(false);
    expect($body.hasClass(sessionDialog.dialogIsOpenClass)).toBe(false);
    expect(sessionDialog.isDialogOpen()).toBe(false);
    expect(sessionDialog.el.close).toHaveBeenCalled();
  });

  it('should save and restore last focused element', () => {
    const button = document.querySelector('.js-dialog-close');
    button.focus();
    sessionDialog.saveLastFocusedEl();
    sessionDialog.openDialog();
    sessionDialog.closeDialog();
    expect(document.activeElement).toBe(button);
  });

  it('should make page content inert and remove inert', () => {
    const content = document.querySelector('#content');
    sessionDialog.makePageContentInert();
    expect(content.inert).toBe(true);
    expect(content.getAttribute('aria-hidden')).toBe('true');
    sessionDialog.removeInertFromPageContent();
    expect(content.inert).toBe(false);
    expect(content.getAttribute('aria-hidden')).toBe('false');
  });

  it('should check if dialog is configured', () => {
    expect(sessionDialog.isConfigured()).toBeTruthy();
  });

  it('should redirect when session times out', () => {
    const spyOnRedirect = jest.spyOn(sessionDialog, 'redirect');
    jest.spyOn(sessionDialog, 'secondsUntilSessionTimeout').mockReturnValue(0);
    sessionDialog.controller();
    expect(spyOnRedirect).toHaveBeenCalled();
  });

  it('should show warning and start countdown', () => {
    const spyOnOpenDialog = jest.spyOn(sessionDialog, 'openDialog');
    const spyOnStartCountdown = jest.spyOn(sessionDialog, 'startCountdown');
    jest.spyOn(sessionDialog, 'secondsUntilSessionTimeout').mockReturnValue(sessionDialog.secondsTimeoutWarning - 1);
    sessionDialog.controller();
    expect(spyOnOpenDialog).toHaveBeenCalled();
    expect(spyOnStartCountdown).toHaveBeenCalled();
  });

  it('should wait for warning when enough time is left', () => {
    const spyOnAddTimer = jest.spyOn(sessionDialog, 'addTimer');
    jest.spyOn(sessionDialog, 'secondsUntilSessionTimeout').mockReturnValue(300);
    sessionDialog.controller();
    expect(spyOnAddTimer).toHaveBeenCalledWith(sessionDialog.controller, sessionDialog.secondsTimeoutWarning);
  });

  it('should use polyfill if HTMLDialogElement is not a function and polyfill registration succeeds', () => {
    Object.defineProperty(window, 'HTMLDialogElement', { value: undefined, configurable: true });
    window.dialogPolyfill.registerDialog.mockImplementation(() => true);
    const result = sessionDialog.init(options);
    expect(window.dialogPolyfill.registerDialog).toHaveBeenCalledWith(window.GOVUK.sessionDialog.el);
    expect(result).toBe(true);
  });

  it('should display fallback element if polyfill registration fails', () => {
    Object.defineProperty(window, 'HTMLDialogElement', { value: undefined, configurable: true });
    window.dialogPolyfill.registerDialog.mockImplementation(() => {
      throw new Error('polyfill error');
    });
    const result = sessionDialog.init(options);
    expect(sessionDialog.$fallBackElement.classList.add).toHaveBeenCalledWith('govuk-!-display-block');
    expect(result).toBe(false);
  });

  it('should bind UI elements and call controller if HTMLDialogElement is a function', () => {
    Object.defineProperty(window, 'HTMLDialogElement', { value: function () { }, configurable: true });
    const result = sessionDialog.init(options);
    expect(sessionDialog.bindUIElements).toHaveBeenCalled();
    expect(sessionDialog.controller).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return false if sessionDialog is not configured', () => {
    jest.spyOn(sessionDialog, 'isConfigured').mockReturnValue(false);
    const result = sessionDialog.init(options);
    expect(sessionDialog.bindUIElements).not.toHaveBeenCalled();
    expect(sessionDialog.controller).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
