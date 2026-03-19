/* eslint-disable max-len, quotes */
'use strict';

let $ ;
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
    window.GOVUK = {};
    originalHTMLDialogElement = HTMLDialogElement;
  });

  beforeEach(() => {
    jest.resetModules();
    window.GOVUK = {};
    $ = require('jquery');

    // Set up the initial DOM structure and jQuery elements for each test
    document.body.innerHTML =
      `<div id='content'><button id="outside-button" type="button">Outside</button></div>` +
      sessionTimeoutWarningHtml.toString();
    require('../../../frontend/themes/gov-uk/client-js/session-timeout-dialog.js');
    sessionDialog = window.GOVUK.sessionDialog;
    $html = $('html');
    $body = $('body');
    options = {
      secondsSessionTimeout: 1800,
      secondsTimeoutWarning: 300
    };
    // Only mock if dialog element exists
    if (sessionDialog.el) {
      sessionDialog.el.showModal = jest.fn();
      sessionDialog.el.close = jest.fn();
    }
    sessionDialog.$fallBackElement = { classList: { add: jest.fn() } };
    window.dialogPolyfill = { registerDialog: jest.fn() };
    // Mock redirect to avoid jsdom navigation errors
    sessionDialog.redirect = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();

    if (originalHTMLDialogElement !== undefined) {
      Object.defineProperty(window, 'HTMLDialogElement', {
        value: originalHTMLDialogElement,
        configurable: true
      });
    } else {
      delete window.HTMLDialogElement;
    }

    jest.restoreAllMocks();
    jest.clearAllMocks();
    if ($html && sessionDialog && sessionDialog.dialogIsOpenClass) {
      $html.removeClass(sessionDialog.dialogIsOpenClass);
    }
    if ($body && sessionDialog && sessionDialog.dialogIsOpenClass) {
      $body.removeClass(sessionDialog.dialogIsOpenClass);
    }
  });

  it('should initialize correctly', () => {
    const bindUIElements = jest.spyOn(sessionDialog, 'bindUIElements');
    const controller = jest.spyOn(sessionDialog, 'controller');
    const result = sessionDialog.init(options);

    expect(result).toBe(true);
    expect(sessionDialog.secondsSessionTimeout).toBe(1800);
    expect(sessionDialog.secondsTimeoutWarning).toBe(300);
    expect(sessionDialog.timeoutRedirectUrl).toBe('/session-timeout');
    expect(bindUIElements).toHaveBeenCalledTimes(1);
    expect(controller).toHaveBeenCalled();
  });

  it('should close the dialog when the close button is clicked', () => {
    const closeDialog = jest.spyOn(sessionDialog, 'closeDialog').mockImplementation(() => {});

    sessionDialog.init(options);
    document.querySelector('.js-dialog-close').click();

    expect(closeDialog).toHaveBeenCalledTimes(1);
  });

  it('should open the dialog', () => {
    const outsideButton = document.querySelector('#outside-button');
    const content = document.querySelector('#content');

    outsideButton.focus();
    sessionDialog.openDialog();

    expect($html.hasClass(sessionDialog.dialogIsOpenClass)).toBe(true);
    expect($body.hasClass(sessionDialog.dialogIsOpenClass)).toBe(true);
    expect(content.inert).toBe(true);
    expect(sessionDialog.el.showModal).toHaveBeenCalled();
    expect(sessionDialog.$lastFocusedEl).toBe(outsideButton);
  });

  it('should close the dialog', () => {
    const refreshSession = jest.spyOn(sessionDialog, 'refreshSession').mockImplementation(() => {});
    const content = document.querySelector('#content');

    sessionDialog.openDialog();
    expect(sessionDialog.isDialogOpen()).toBe(true);
    sessionDialog.closeDialog();

    expect($html.hasClass(sessionDialog.dialogIsOpenClass)).toBe(false);
    expect($body.hasClass(sessionDialog.dialogIsOpenClass)).toBe(false);
    expect(content.inert).toBe(false);
    expect(sessionDialog.isDialogOpen()).toBe(false);
    expect(sessionDialog.el.close).toHaveBeenCalled();
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it('should save and restore last focused element', () => {
    jest.useFakeTimers();

    const outsideButton = document.querySelector('#outside-button');
    jest.spyOn(sessionDialog, 'refreshSession').mockImplementation(() => {});

    outsideButton.focus();
    sessionDialog.openDialog();
    sessionDialog.closeDialog();
    jest.runAllTimers();

    expect(document.activeElement).toBe(outsideButton);
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
    sessionDialog.init(options);

    expect(Boolean(sessionDialog.isConfigured())).toBe(true);
  });

  it('should redirect when session times out', () => {
    const spyOnRedirect = jest.spyOn(sessionDialog, 'redirect');
    const spyOnOpenDialog = jest.spyOn(sessionDialog, 'openDialog');

    Object.assign(sessionDialog, options);
    jest.spyOn(sessionDialog, 'secondsUntilSessionTimeout').mockReturnValue(0);

    sessionDialog.controller();

    expect(spyOnRedirect).toHaveBeenCalled();
    expect(spyOnOpenDialog).not.toHaveBeenCalled();
  });

  it('should show warning and start countdown', () => {
    const spyOnOpenDialog = jest.spyOn(sessionDialog, 'openDialog');
    const spyOnStartCountdown = jest.spyOn(sessionDialog, 'startCountdown');
    const spyOnAddTimer = jest.spyOn(sessionDialog, 'addTimer');

    Object.assign(sessionDialog, options);
    jest.spyOn(sessionDialog, 'secondsUntilSessionTimeout').mockReturnValue(sessionDialog.secondsTimeoutWarning - 1);

    sessionDialog.controller();

    expect(spyOnOpenDialog).toHaveBeenCalled();
    expect(spyOnStartCountdown).toHaveBeenCalled();
    expect(spyOnAddTimer).toHaveBeenCalledWith(sessionDialog.controller, sessionDialog.secondsTimeoutWarning - 1);
  });

  it('should wait for warning when enough time is left', () => {
    const spyOnAddTimer = jest.spyOn(sessionDialog, 'addTimer');
    const spyOnOpenDialog = jest.spyOn(sessionDialog, 'openDialog');
    const spyOnStartCountdown = jest.spyOn(sessionDialog, 'startCountdown');

    Object.assign(sessionDialog, options);
    jest.spyOn(sessionDialog, 'secondsUntilSessionTimeout').mockReturnValue(sessionDialog.secondsTimeoutWarning + 1);
    jest.spyOn(sessionDialog, 'secondsUntilTimeoutWarning').mockReturnValue(1);

    sessionDialog.controller();

    expect(spyOnOpenDialog).not.toHaveBeenCalled();
    expect(spyOnStartCountdown).not.toHaveBeenCalled();
    expect(spyOnAddTimer).toHaveBeenCalledWith(sessionDialog.controller, 1);
  });

  it('should use polyfill if HTMLDialogElement is not a function and polyfill registration succeeds', () => {
    const bindUIElements = jest.spyOn(sessionDialog, 'bindUIElements');
    const controller = jest.spyOn(sessionDialog, 'controller');

    Object.defineProperty(window, 'HTMLDialogElement', { value: undefined, configurable: true });
    window.dialogPolyfill.registerDialog.mockImplementation(() => true);

    const result = sessionDialog.init(options);

    expect(window.dialogPolyfill.registerDialog).toHaveBeenCalledWith(window.GOVUK.sessionDialog.el);
    expect(bindUIElements).not.toHaveBeenCalled();
    expect(controller).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should display fallback element if polyfill registration fails', () => {
    const bindUIElements = jest.spyOn(sessionDialog, 'bindUIElements');
    const controller = jest.spyOn(sessionDialog, 'controller');

    Object.defineProperty(window, 'HTMLDialogElement', { value: undefined, configurable: true });
    window.dialogPolyfill.registerDialog.mockImplementation(() => {
      throw new Error('polyfill error');
    });

    const result = sessionDialog.init(options);

    expect(sessionDialog.$fallBackElement.classList.add).toHaveBeenCalledWith('govuk-!-display-block');
    expect(bindUIElements).not.toHaveBeenCalled();
    expect(controller).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should bind UI elements and call controller if HTMLDialogElement is a function', () => {
    const bindUIElements = jest.spyOn(sessionDialog, 'bindUIElements');
    const controller = jest.spyOn(sessionDialog, 'controller');

    Object.defineProperty(window, 'HTMLDialogElement', { value: function () { }, configurable: true });

    const result = sessionDialog.init(options);

    expect(bindUIElements).toHaveBeenCalledTimes(1);
    expect(controller).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should return false if sessionDialog is not configured', () => {
    const bindUIElements = jest.spyOn(sessionDialog, 'bindUIElements');
    const controller = jest.spyOn(sessionDialog, 'controller');

    sessionDialog.$timer = $([]);

    const result = sessionDialog.init(options);

    expect(bindUIElements).not.toHaveBeenCalled();
    expect(controller).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it('refreshSession updates timeSessionRefreshed and calls controller on success', () => {
    const previousRefreshTime = new Date('2020-01-01T00:00:00.000Z');
    sessionDialog.timeSessionRefreshed = previousRefreshTime;

    const controllerSpy = jest.spyOn(sessionDialog, 'controller').mockImplementation(() => {});
    const requestMock = {
      done: jest.fn(),
      fail: jest.fn()
    };

    requestMock.done.mockImplementation(cb => {
      cb();
      return requestMock;
    });
    requestMock.fail.mockReturnValue(requestMock);

    jest.spyOn($, 'get').mockReturnValue(requestMock);

    sessionDialog.refreshSession();

    expect(sessionDialog.timeSessionRefreshed.getTime()).toBeGreaterThan(previousRefreshTime.getTime());
    expect(controllerSpy).toHaveBeenCalledTimes(1);
  });

  it('refreshSession calls redirect on failure and does not call controller', () => {
    const controllerSpy = jest.spyOn(sessionDialog, 'controller').mockImplementation(() => {});
    const redirectSpy = jest.spyOn(sessionDialog, 'redirect').mockImplementation(() => {});
    const requestMock = {
      done: jest.fn(),
      fail: jest.fn()
    };

    requestMock.done.mockReturnValue(requestMock);
    requestMock.fail.mockImplementation(cb => {
      cb();
      return requestMock;
    });

    jest.spyOn($, 'get').mockReturnValue(requestMock);

    sessionDialog.refreshSession();

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(controllerSpy).not.toHaveBeenCalled();
  });
});
