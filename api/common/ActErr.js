'use strict';

var self = ActErr;
global.ActErr = self;

// HTTP 400 series
ActErr.DBOperationFailed = 4001;
ActErr.ParamNotFound = 4002;
ActErr.InvalidParam = 4003;
ActErr.BodyNotFound = 4004;
ActErr.DataNotFound = 4005;
// HTTP 404 series
ActErr.DBEntityNotFound = 4041;
// HTTP 409 series
ActErr.DBDuplicateKeyError = 4091;

function ActErr(methodName, id, message, error) {
  this.methodName = methodName || 'unknown method';
  this.id = id;
  this.message = message || 'unknown error';
  if (error)
    this.link = error;
}
