'use strict';

var self = respondWithError;
global.respondWithError = self;

function respondWithError(res, err) {
  _logFullStackActError(err);

  err = _getDeepestLinkedError(err);

  var statusCode = _removeLastDigit(err.id);
  if (!statusCode) statusCode = 500;

  res.status(statusCode).json(err);
}

function _removeLastDigit(id) {
  return Math.floor(id/10);
}

function _getDeepestLinkedError(err) {
  while (err.link && err.link.id)
    err = err.link;
  return err;
}

function _logFullStackActError(err) {
  do {
    logger.error(err.methodName, err.message);

    if (err.stack) logger.error(err.stack);
    err = err.link;
  }
  while (err);
}
