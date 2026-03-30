/* eslint-disable max-len */
'use strict';

const markdown = require('../../lib/markdown');
const fs = require('fs');

describe('markdown middleware', () => {
  let middleware;
  let req;
  let res;
  let next;
  let View;

  const setupAppGet = (views = ['/path/to/my/views'], viewClass = View) => {
    req.app.get.mockImplementation(key => {
      if (key === 'views') return views;
      if (key === 'view') return viewClass;
      return undefined;
    });
  };

  beforeEach(() => {
    req = { app: { get: jest.fn() } };
    res = { locals: {} };
    next = jest.fn();

    View = jest.fn(function (name) {
      this.path = `/path/to/my/views/content/en/${name}.md`;
    });

    setupAppGet();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('# some markdown');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a middleware function', () => {
    middleware = markdown();
    expect(typeof middleware).toBe('function');
    expect(middleware.length).toBe(3);
  });

  describe('with default config', () => {
    beforeEach(() => {
      middleware = markdown();
    });

    it('calls through to next', () => {
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('adds a `markdown` function to res.locals', () => {
      middleware(req, res, next);
      expect(typeof res.locals.markdown).toBe('function');
    });

    describe('res.locals.markdown', () => {
      beforeEach(() => {
        fs.readFileSync.mockImplementation(filePath => {
          switch (filePath) {
            case '/path/to/my/views/content/en/file.md':
              return '# hello world';
            case '/path/to/my/views/content/en/other.md':
              return '# hello other';
            case '/path/to/my/views/content/en/html.md':
              return '<h1>hello html</h1>';
            case '/path/to/my/views/content/en/table.md':
              return '| heading | \n |---| \n | hello table |';
            default:
              return '# some markdown';
          }
        });

        middleware(req, res, next);
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('returns a function with a single argument', () => {
        const render = res.locals.markdown;
        expect(typeof render).toBe('function');
        expect(render.length).toBe(1);
      });

      it('throws if not passed a file name', () => {
        expect(() => {
          res.locals.markdown();
        }).toThrow();
      });

      it('instantiates an express View class', () => {
        res.locals.markdown('file');
        expect(View).toHaveBeenCalledTimes(1);
        expect(View).toHaveBeenCalledWith('file', expect.any(Object));
      });

      it('passes the file name to View', () => {
        res.locals.markdown('file');
        expect(View).toHaveBeenCalledWith('file', expect.any(Object));
      });

      it('passes the `md` extension to View as an option', () => {
        res.locals.markdown('file');
        expect(View).toHaveBeenLastCalledWith(
          expect.any(String),
          expect.objectContaining({ defaultEngine: 'md' })
        );
      });

      it('passes dummy engines to View as an option', () => {
        res.locals.markdown('file');
        const options = View.mock.lastCall[1];
        expect(Object.keys(options.engines)).toContain('.md');
        expect(options.engines['.md']).toBeTruthy();
      });

      it('passes an array of views to View as an option with languages added as per req.lang', () => {
        req.lang = ['de', 'en'];
        res.locals.markdown('file');
        expect(View).toHaveBeenLastCalledWith(
          expect.any(String),
          expect.objectContaining({
            root: ['/path/to/my/views/content/de', '/path/to/my/views/content/en', '/path/to/my/views/content']
          })
        );
      });

      it('can handle multiple views directories', () => {
        req.lang = ['de', 'en'];
        setupAppGet(['/path/to/my/views', '/path/to/other/views']);
        res.locals.markdown('file');
        expect(View).toHaveBeenLastCalledWith(
          expect.any(String),
          expect.objectContaining({
            root: [
              '/path/to/my/views/content/de',
              '/path/to/my/views/content/en',
              '/path/to/my/views/content',
              '/path/to/other/views/content/de',
              '/path/to/other/views/content/en',
              '/path/to/other/views/content'
            ]
          })
        );
      });

      it('throws if View does not resolve a path', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        setupAppGet(['/path/to/my/views'], function () {
          this.path = null;
        });
        middleware(req, res, next);
        expect(() => {
          res.locals.markdown('file');
        }).toThrow();
      });

      it('returns file contents parsed as markdown', () => {
        expect(res.locals.markdown('file').toString()).toBe('<h1>hello world</h1>\n');
        expect(res.locals.markdown('other').toString()).toBe('<h1>hello other</h1>\n');
      });

      it('preserves html', () => {
        expect(res.locals.markdown('html').toString()).toBe('<h1>hello html</h1>');
      });

      it('supports tables', () => {
        expect(res.locals.markdown('table').toString()).toBe(
          '<table>\n<thead>\n<tr>\n<th>heading</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>hello table</td>\n</tr>\n</tbody>\n</table>\n'
        );
      });
    });
  });

  describe('with custom config', () => {
    describe('method', () => {
      it('adds a method named according to `method` option to res.locals', () => {
        middleware = markdown({ method: 'custom' });
        middleware(req, res, next);
        expect(typeof res.locals.custom).toBe('function');
      });
    });

    describe('ext', () => {
      beforeEach(() => {
        middleware = markdown({ ext: 'markdown' });
        middleware(req, res, next);
      });

      it('passes the custom extension to View as an option', () => {
        res.locals.markdown('file');
        expect(View).toHaveBeenLastCalledWith(
          expect.any(String),
          expect.objectContaining({ defaultEngine: 'markdown' })
        );
      });

      it('passes dummy engines to View as an option', () => {
        res.locals.markdown('file');
        const options = View.mock.lastCall[1];
        expect(Object.keys(options.engines)).toContain('.markdown');
        expect(options.engines['.markdown']).toBeTruthy();
      });
    });

    describe('dir', () => {
      beforeEach(() => {
        middleware = markdown({ dir: 'snippets' });
        middleware(req, res, next);
      });

      it('passes an array of views to View as an option with languages added as per req.lang', () => {
        req.lang = ['de', 'en'];
        res.locals.markdown('file');
        expect(View).toHaveBeenLastCalledWith(
          expect.any(String),
          expect.objectContaining({
            root: ['/path/to/my/views/snippets/de', '/path/to/my/views/snippets/en', '/path/to/my/views/snippets']
          })
        );
      });
    });

    describe('fallbackLang', () => {
      beforeEach(() => {
        middleware = markdown({ fallbackLang: ['en', ''] });
        middleware(req, res, next);
      });

      it('adds custom fallback languages to request languages', () => {
        req.lang = ['de', 'fr'];
        res.locals.markdown('file');
        expect(View).toHaveBeenLastCalledWith(
          expect.any(String),
          expect.objectContaining({
            root: [
              '/path/to/my/views/content/de',
              '/path/to/my/views/content/fr',
              '/path/to/my/views/content/en',
              '/path/to/my/views/content'
            ]
          })
        );
      });
    });
  });
});
