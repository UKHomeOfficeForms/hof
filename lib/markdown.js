'use strict';

const MarkdownIt = require('markdown-it');
const converter = new MarkdownIt({ html: true });
const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');

const cache = {};

module.exports = conf => {
  const config = conf || {};
  config.dir = config.dir || 'content';
  config.method = config.method || 'markdown';
  config.fallbackLang = config.fallbackLang || ['en', ''];
  config.ext = config.ext || 'md';
  return (req, res, next) => {
    const View = req.app.get('view');
    res.locals[config.method] = file => {
      if (!file) {
        throw new Error('markdown: filename must be specified');
      }
      const views = req.app.get('views');
      const languages = Array.from(new Set([].concat(req.lang || []).concat(config.fallbackLang)))
        .filter(language => typeof language === 'string');

      const fileName = file;
      const fileWithExt = file.endsWith(`.${config.ext}`)
        ? file
        : `${file}.${config.ext}`;

      const roots = views.flatMap(dir =>
        languages.map(lang =>
          path.resolve(dir, config.dir, lang.toLowerCase())
        )
      );

      // use express' `View` class to shortcut looking up files
      const view = new View(fileName, {
        defaultEngine: config.ext,
        root: roots,
        engines: { [`.${config.ext}`]: {} }
      });

      let resolvedPath = view.path;

      // Fallback if View fails to resolve properly
      if (!resolvedPath || resolvedPath === fileName) {
        for (const root of roots) {
          const fullPath = path.join(root, fileWithExt);
          if (fs.existsSync(fullPath)) {
            resolvedPath = fullPath;
            break;
          }
        }
      }

      if (!resolvedPath || !fs.existsSync(resolvedPath)) {
        throw new Error(`Could not find content: ${fileName}`);
      }

      const md = cache[resolvedPath] || fs.readFileSync(resolvedPath, 'utf8');
      cache[resolvedPath] = md;
      return new nunjucks.runtime.SafeString(converter.render(md));
    };
    next();
  };
};
