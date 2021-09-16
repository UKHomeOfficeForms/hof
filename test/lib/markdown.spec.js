'use strict';
/* global request response */

const markdown = require('../../lib/markdown');
const fs = require('fs');

describe('markdown middleware', () => {
  let middleware;
  let req;
  let res;
  let next;
  let View;

  beforeEach(() => {
    req = request();
    res = response();
    next = sinon.stub();
    req.app.get.withArgs('views').returns(['/path/to/my/views']);
    sinon.stub(fs, 'readFileSync').returns('# some markdown');

    View = sinon.spy(function (name) {
      this.path = `/path/to/my/views/content/en/${name}.md`;
    });
    // this is an express internal View class by default
    // https://github.com/expressjs/express/blob/master/lib/view.js
    req.app.get.withArgs('view').returns(View);
  });

  afterEach(() => {
    fs.readFileSync.restore();
  });

  it('returns a middleware function', () => {
    middleware = markdown();
    expect(middleware).to.be.a('function');
    expect(middleware.length).to.equal(3);
  });

  describe('with default config', () => {
    beforeEach(() => {
      middleware = markdown();
    });

    it('calls through to next', () => {
      middleware(req, res, next);
      expect(next).to.have.been.calledOnce;
      expect(next).to.have.been.calledWithExactly();
    });

    it('adds a `markdown` function to res.locals', () => {
      middleware(req, res, next);
      expect(res.locals.markdown).to.be.a('function');
    });

    describe('res.locals.markdown', () => {
      beforeEach(() => {
        fs.readFileSync
          .withArgs('/path/to/my/views/content/en/file.md').returns('# hello world')
          .withArgs('/path/to/my/views/content/en/other.md').returns('# hello other')
          .withArgs('/path/to/my/views/content/en/html.md').returns('<h1>hello html</h1>')
          .withArgs('/path/to/my/views/content/en/table.md').returns('| heading | \n |---| \n | hello table |');
        middleware(req, res, next);
      });

      it('returns a function with a single argument', () => {
        const render = res.locals.markdown();
        expect(render).to.be.a('function');
        expect(render.length).to.equal(1);
      });

      it('throws if not passed a file name', () => {
        expect(() => {
          res.locals.markdown()();
        }).to.throw();
      });

      it('instantiates an express View class', () => {
        res.locals.markdown()('file');
        expect(View).to.have.been.calledOnce;
        expect(View).to.have.been.calledWithNew;
      });

      it('passes the file name to View', () => {
        res.locals.markdown()('file');
        expect(View).to.have.been.calledWith('file');
      });

      it('passes the `md` extension to View as an option', () => {
        res.locals.markdown()('file');
        expect(View).to.have.been.calledWith(sinon.match.any, sinon.match({
          defaultEngine: 'md'
        }));
      });

      it('passes dummy engines to View as an option', () => {
        res.locals.markdown()('file');
        expect(View.lastCall.args[1].engines).to.have.property('.md');
        expect(View.lastCall.args[1].engines['.md']).to.be.ok;
      });

      it('passes an array of views to View as an option with languages added as per req.lang', () => {
        req.lang = ['de', 'en'];
        res.locals.markdown()('file');
        expect(View).to.have.been.calledWith(sinon.match.any, sinon.match({
          root: ['/path/to/my/views/content/de', '/path/to/my/views/content/en', '/path/to/my/views/content']
        }));
      });

      it('can handle multiple views directories', () => {
        req.lang = ['de', 'en'];
        req.app.get.withArgs('views').returns(['/path/to/my/views', '/path/to/other/views']);
        res.locals.markdown()('file');
        expect(View).to.have.been.calledWith(sinon.match.any, sinon.match({
          root: [
            '/path/to/my/views/content/de', '/path/to/my/views/content/en', '/path/to/my/views/content',
            '/path/to/other/views/content/de', '/path/to/other/views/content/en', '/path/to/other/views/content'
          ]
        }));
      });

      it('throws if View does not resolve a path', () => {
        req.app.get.withArgs('view').returns(function () {
          this.path = null;
        });
        middleware(req, res, next);
        expect(() => {
          res.locals.markdown()('file');
        }).to.throw();
      });

      it('returns file contents parsed as markdown', () => {
        expect(res.locals.markdown()('file')).to.equal('<h1>hello world</h1>\n');
        expect(res.locals.markdown()('other')).to.equal('<h1>hello other</h1>\n');
      });

      it('preserves html', () => {
        expect(res.locals.markdown()('html')).to.equal('<h1>hello html</h1>');
      });

      it('supports tables', () => {
        expect(res.locals.markdown()('table'))
          // eslint-disable-next-line max-len
          .to.equal('<table>\n<thead>\n<tr>\n<th>heading</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>hello table</td>\n</tr>\n</tbody>\n</table>\n');
      });
    });
  });

  describe('with custom config', () => {
    describe('method', () => {
      it('adds a method named according to `method` option to res.locals', () => {
        middleware = markdown({ method: 'custom' });
        middleware(req, res, next);
        expect(res.locals.custom).to.be.a('function');
      });
    });

    describe('ext', () => {
      beforeEach(() => {
        middleware = markdown({ ext: 'markdown' });
        middleware(req, res, next);
      });

      it('passes the custom extension to View as an option', () => {
        res.locals.markdown()('file');
        expect(View).to.have.been.calledWith(sinon.match.any, sinon.match({
          defaultEngine: 'markdown'
        }));
      });

      it('passes dummy engines to View as an option', () => {
        res.locals.markdown()('file');
        expect(View.lastCall.args[1].engines).to.have.property('.markdown');
        expect(View.lastCall.args[1].engines['.markdown']).to.be.ok;
      });
    });

    describe('dir', () => {
      beforeEach(() => {
        middleware = markdown({ dir: 'snippets' });
        middleware(req, res, next);
      });

      it('passes an array of views to View as an option with languages added as per req.lang', () => {
        req.lang = ['de', 'en'];
        res.locals.markdown()('file');
        expect(View).to.have.been.calledWith(sinon.match.any, sinon.match({
          root: ['/path/to/my/views/snippets/de', '/path/to/my/views/snippets/en', '/path/to/my/views/snippets']
        }));
      });
    });

    describe('fallbackLang', () => {
      beforeEach(() => {
        middleware = markdown({ fallbackLang: ['en', ''] });
        middleware(req, res, next);
      });

      it('adds custom fallback languages to request languages', () => {
        req.lang = ['de', 'fr'];
        res.locals.markdown()('file');
        expect(View).to.have.been.calledWith(sinon.match.any, sinon.match({
          root: [
            '/path/to/my/views/content/de',
            '/path/to/my/views/content/fr',
            '/path/to/my/views/content/en',
            '/path/to/my/views/content'
          ]
        }));
      });
    });
  });
});
