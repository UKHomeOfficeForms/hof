'use strict';

const passport = require('passport');
const OpenIDConnectStrategy = require('passport-openidconnect');

function parseJwt (token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

const setUpAuth = (app, config) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new OpenIDConnectStrategy({
    issuer: config.keycloak.issuer,
    authorizationURL: config.keycloak.authorizationURL,
    tokenURL: config.keycloak.tokenURL,
    userInfoURL: config.keycloak.userInfoURL,
    clientID: config.keycloak.clientID,
    clientSecret: config.keycloak.clientSecret,
    callbackURL: config.keycloak.callbackURL,
    scope: ['profile']
  }, (
    uiProfile,
    profile,
    idToken,
    jwtClaims,
    accessToken,
    refreshToken,
    cb
  ) => {
    console.log(`uiProfile=${JSON.stringify(uiProfile, null, 2)}`);
    console.log(`profile=${JSON.stringify(profile, null, 2)}`);
    console.log(`idToken=${JSON.stringify(idToken, null, 2)}`);
    console.log(`token=${parseJwt(accessToken)}`);
    
    profile.idToken = idToken
    profile.roles = uiProfile?._json?.roles
    profile.firstName = profile.name?.givenName
    profile.lastName = profile.name?.familyName
    profile.title = uiProfile?._json?.title
    profile.username = jwtClaims?.preferred_username
    profile.email = jwtClaims?.email
    profile.groups = jwtClaims?.groups
    profile.roles = parseJwt(accessToken)["realm_access"]["roles"]
    profile.parsedToken = parseJwt(accessToken)
    profile.accessToken = accessToken

    return cb(null, profile)
  }));

  // Handles serialization and deserialization of authenticated user
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Login success callback
  const loginOidc = async function (req, res, user) {
    console.log('OIDC Login success', user);
    req.session.user = req.user;
    return res.redirect(req.baseUrl);
  }

  // Login route
  app.get(config.keycloak.loginRoute, passport.authenticate('openidconnect'));

  // Login callback route to get token
  app.get(config.keycloak.loginCallbackRoute, async (req, res, next) => {
    return await passport.authenticate(
      'openidconnect',
      async (err, user, info) => {
        console.log('Authentication via OIDC');
        if (err) {
          console.log('OIDC Login failed', err);
          return next(err);
        };

        if (!user) {
          console.log('OIDC Autentication failed', info);
          return res.status(401).json(info);
        };

        req.login(user, async (loginErr) => {
          if (loginErr) {
            console.log('OIDC Login error', loginErr);
            return next(loginErr);
          };

          return await loginOidc(req, res, user)
        });
      }
    )(req, res, next);
  });
};

module.exports.setUpAuth = setUpAuth;
