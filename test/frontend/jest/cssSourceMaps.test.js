/* eslint-disable no-unused-vars */
'use strict';

const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

const sassTask = require('../../../build/tasks/sass');

const mkdir = require('../../../build/lib/mkdir');
jest.mock('../../../build/lib/mkdir', () => {
  return () => Promise.resolve();
}
);

const fs = require('fs');
jest.mock('fs', () => ({
  writeFile: jest.fn((path, data, callback) => {
    if (path.includes('public/css/app.css')) {
      callback(null);
    } else {
      callback(new Error('File not found'));
    }
  })}));

const logger = require('../../../lib/logger');
jest.mock('../../../lib/logger', () => {
  return jest.fn(() => ({
    info: mockLoggerInfo,
    error: mockLoggerError,
    logSession: jest.fn()
  }));
});

const sass = require('sass');
jest.mock('sass', () => ({
  render: jest.fn((options, callback) => {
    if (options.file === 'assets/scss/app.scss') {
      const map = options.sourceMap ? JSON.stringify({ version: 3, file: 'app.css', sources: ['app.scss'] }) : null;
      callback(null, {
        css: 'body { color: red; }',
        map
      });
    } else {
      callback(new Error('File not found'));
    }
  })
}));

describe('Sass Task with Source Maps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFile.mockClear();
    sass.render.mockClear();
  });

  it('does not execute the Sass task if no configuration is provided', async () => {
    await sassTask({});
    expect(fs.writeFile.mock.lastCall).toBe(undefined);
  });

  it('writes both CSS and sourcemap files and logs a success message when source maps are enabled', async () => {
    await sassTask({
      sass: {
        src: 'assets/scss/app.scss',
        out: 'public/css/app.css',
        match: 'assets/scss/**/*.scss',
        restart: false,
        quietDeps: false,
        outputStyle: 'expanded',
        sourceMaps: true
      }
    });

    expect(fs.writeFile).toHaveBeenCalledTimes(2);

    expect(
      mockLoggerInfo.mock.calls[0][0]
    ).toBe('Sourcemap created successfully:');

    expect(
      mockLoggerInfo.mock.calls[0][1]
    ).toContain('public/css/app.css.map');

    expect(
      mockLoggerError.mock.calls.length
    ).toBe(0);
  });

  it('does not create sourcemap files when option is disabled in config', async () => {
    await sassTask({
      sass: {
        src: 'assets/scss/app.scss',
        out: 'public/css/app.css',
        match: 'assets/scss/**/*.scss',
        restart: false,
        quietDeps: false,
        outputStyle: 'expanded',
        sourceMaps: false
      }
    });

    expect(fs.writeFile).toHaveBeenCalledTimes(1);

    expect(
      mockLoggerInfo.mock.calls.length
    ).toBe(0);

    expect(
      mockLoggerError.mock.calls.length
    ).toBe(0);
  });
});
