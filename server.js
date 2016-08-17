'use strict';

process.title = '5-in-a-row';
module.exports = createExpressApp;
// To allow the apiAdapter to make more than five calls at a time:
require('http').globalAgent.maxSockets = 10000;

require('./api/common/logger.js');
require('./api/common/ActErr.js');
require('./api/common/express/sendJSONResponse.js');
require('./api/common/express/sendXMLResponse.js');
require('./api/common/respondWithError.js');

var glob = require('glob');
var express = require('express');
var mongoose = require('mongoose');
var ignoreEADDRINUSE = false;

global.async = require('async');
global.util = require('util');
global._ = require('underscore');

if (require.main === module) {
  global.app = createExpressApp(process.env.DB_URL);
  module.exports = global.app;
}

process.on('uncaughtException', function (err) {
  if (ignoreEADDRINUSE && err.errno === 'EADDRINUSE') {
    return;
  }
  _logErrorAndExit('Uncaught Exception thrown.', err);
});

function createExpressApp(mongoUrl) {
  try {
    var app = express();

    // Set up morgan and mongoose logging only if we're running in dev mode
    if (process.env.RUN_MODE === 'dev') {
      app.use(require('morgan')('dev'));
      mongoose.set('debug', true);
    }

    app.use(require('body-parser').json({limit: '10mb'}));
    app.use(require('body-parser').urlencoded({limit: '10mb', extended: true}));
    app.use(require('cookie-parser')());
    app.use(require('method-override')());
    app.use(require('./api/common/express/errorHandler.js'));
    app.use(require('./api/common/express/setCORSHeaders.js'));
    var mongoCallback = _onceMongoConnected.bind(null, app, mongoUrl);
    mongoose.connect(mongoUrl + '/FIAR', {}, mongoCallback);

    return app;
  } catch (err) {
    _logErrorAndExit('Uncaught Exception thrown from createExpressApp.', err);
  }
}

function _onceMongoConnected(app, mongoUrl, err) {
  if (err)
    _logErrorAndExit('MongoDB error. could not connect to: ' + mongoUrl, err);
  logger.info('MongoDB: ' + mongoUrl + ' connected.');

  async.series([
      _createConfigFromEnvironment.bind(null, app),
      _requireRoutes.bind(null, app),
      _startListening.bind(null, app)
    ],
    function (err) {
      if (err)
        _logErrorAndExit(err.message, err);
    }
  );
}

function _createConfigFromEnvironment(app, next) {
  var who = 'server.js|' + _createConfigFromEnvironment.name;
  logger.debug(who, 'Inside');

  global.config = {};

  var configErrors = [];

  if (process.env.DB_URL)
    global.config.DB_URL = process.env.DB_URL;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'DB_URL is not defined'));

  if (process.env.SERVER_PORT)
    global.config.SERVER_PORT = process.env.SERVER_PORT;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'SERVER_PORT is not defined'));

  logger.debug('Platform config:', config);
  if (configErrors.length)
    next(configErrors);
  else next();
}

function _requireRoutes(app, next) {
  var who = 'server.js|' + _requireRoutes.name;
  logger.debug(who, 'Inside');
  glob.sync('./api/**/*Routes.js').forEach(_requireRoute.bind(null, app));

  return next();
}

function _startListening(app, next) {
  var who = 'server.js|' + _startListening.name;
  logger.debug(who, 'Inside');

  var apiPort = config.SERVER_PORT;
  var tries = 0;
  ignoreEADDRINUSE = true;
  listen();
  function listen(error) {
    if (!apiPort)
      return next(
        new ActErr(who, ActErr.InternalServer,
          'Failed to start server.', new Error('Invalid port.'))
      );
    if (!error) {
      try {
        app.listen(apiPort, '0.0.0.0',
          _logServerListening.bind(null, apiPort, listen));
      } catch (err) {
        error = err;
      }
    }
    if (error) {
      if (tries > 3) {
        ignoreEADDRINUSE = false;
        var errMessage = 'unable to listen: ' + apiPort;
        return next(
          new ActErr(who, ActErr.InternalServer, errMessage, error)
        );
      }
      tries += 1;
      listen();
    }
  }
}

function _requireRoute(app, routeFile) {
  require(routeFile)(app);
}

function _logServerListening(port, listen, err) {
  var url = '0.0.0.0:' + port;
  if (err) return listen(err);
  logger.info('server started on %s.', url);
  ignoreEADDRINUSE = false;
}

function _logErrorAndExit(message, err) {
  logger.error(message);
  logger.error(err);
  if (err.stack) logger.error(err.stack);
  setTimeout(function () {
    process.exit();
  }, 3000);
}
