'use strict';

const nunjucks = require('nunjucks');

module.exports = {
  middleware(app, nunjucksEnv, config) {
    const renderCache = new Map();

    config = config || nunjucksEnv.config || {};

    function renderString(value, ctx, path) {
      value = String(value);

      if (value.indexOf('{{') === -1 && value.indexOf('{%') === -1) return value;

      let template;

      if (!config.noCache && renderCache.has(value)) {
        // can prob log debug cache here
        template = renderCache.get(value);
      } else {
        template = new nunjucks.Template(value, nunjucksEnv, `locale: ${ctx.htmlLang}:${path}`);

        if (!config.noCache) {
          renderCache.set(value, template);
        }
      }

      return template.render(ctx);
    }

    function recursiveRender(value, ctx, path) {
      if (Array.isArray(value)) {
        return value.map((item, idx) => recursiveRender(item.ctx, `${path}.${idx}`));
      }

      if (value && typeof value === 'object') {
        let result = {};

        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            result[key] = recursiveRender(value[key], ctx, `${path}.${key}`);
          }
        }

        return result;
      }

      return renderString(value, ctx, path);
    }

    return (req, res, next) => {
      Object.assign(res.locals, app.locals);

      res.locals.t = res.locals.translate = (key, options) => {
        options = options || {};
        const text = req.translate ? req.translate(key, options) : key;
        if (text === false || text === undefined || text === null) return;
        if (options.noRender) return text;
        return recursiveRender(text, options.ctx || res.locals, String(key));
      }
      res.locals.ctx = key => key ? key.split('.').reduce((item, key) => item && item[key], res.locals) : res.locals;
      next();
    }
  }
}
