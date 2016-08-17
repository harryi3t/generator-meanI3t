/*global logger*/
'use strict';
var util = require('util');

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  var statusCode = 500;
  logger.error('Unhandled error:', {
    user: req.user && req.user.id || 'Unauthenticated user',
    url: req.url,
    error: err,
    stack: err.stack
  });
  if (err.statusCode === 413) {
    statusCode = 413;
    res.status(statusCode).send({});
  } else {
    res.status(statusCode).send({});
  }
}

