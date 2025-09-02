const request = require('supertest');
const express = require('express');

describe('bootstrap /session-timeout route', () => {
  let app;
  let locals;

  beforeEach(() => {
    app = express();
    app.use(require('cookie-parser')());

    // Mock a session
    app.use((req, res, next) => {
      if (typeof req.headers['x-session-exists'] !== 'undefined') {
        req.session = { exists: req.headers['x-session-exists'] === 'true' };
      }
      next();
    });

    // Mock translations
    app.use((req, res, next) => {
      req.translate = () => ({ 404: { message: 'Page does not exist' } });
      next();
    });

    // The /session-timeout routing
    app.get('/session-timeout', (req, res, next) => {
      if ((req.cookies['hof-wizard-sc']) && (!req.session || req.session.exists !== true)) {
        const err = new Error('Session expired');
        err.code = 'SESSION_TIMEOUT';
        return next(err);
      }
      const err = new Error('Not Found');
      err.status = 404;
      locals = Object.assign({}, req.translate('errors'));
      if (locals && locals['404']) {
        return res.status(404).send(locals['404'].message);
      }
      return res.status(404).send('Page Not Found');
    });

    // Mock error middleware
    app.use((err, req, res, next) => {
      if (err.code === 'SESSION_TIMEOUT') {
        return res.status(401).send('Session Timeout');
      }
      if (err.status === 404) {
        return res.status(404).send('Page Not Found');
      }
      return next();
    });
  });

  it('responds with 401 Session Timeout if session cookie present but session missing', async () => {
    const response = await request(app)
      .get('/session-timeout')
      .set('Cookie', 'hof-wizard-sc=1');
    expect(response.status).toBe(401);
    expect(response.text).toContain('Session Timeout');
  });

  it('responds with 401 Session Timeout if session cookie present but session inactive', async () => {
    const response = await request(app)
      .get('/session-timeout')
      .set('Cookie', 'hof-wizard-sc=1')
      .set('x-session-exists', 'false');
    expect(response.status).toBe(401);
    expect(response.text).toContain('Session Timeout');
  });

  it('responds with 404 Page Not Found if no session cookie', async () => {
    const response = await request(app)
      .get('/session-timeout');
    expect(response.status).toBe(404);
    expect(response.text).toContain('Page does not exist');
  });

  it('responds with 404 Page Not Found if session cookie present and session active', async () => {
    const response = await request(app)
      .get('/session-timeout')
      .set('Cookie', 'hof-wizard-sc=1')
      .set('x-session-exists', 'true');
    expect(response.status).toBe(404);
    expect(response.text).toContain('Page does not exist');
  });
});
