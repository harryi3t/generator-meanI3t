'use strict';

var self = ApiAdapter;
module.exports = self;

var async = require('async');
var request = require('request');

function ApiAdapter(token) {
  logger.info('Initializing', self.name, 'with token:', token);

  this.token = token;
}

var baseUrl = 'http://localhost:' + config.apiPort;

/***********************/
/*     HTTP METHODS    */
/***********************/
/* GET PUT POST DELETE */
/***********************/

ApiAdapter.prototype.get = function (relativeUrl, callback) {
  logger.debug('ApiAdapter GET data ', relativeUrl);

  var opts = {
    method: 'GET',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  };

  if (this.token)
    opts.headers.Authorization = 'apiToken ' + this.token;

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

ApiAdapter.prototype.post = function (relativeUrl, obj, callback) {
  logger.debug('ApiAdapter POST data ', relativeUrl);

  var opts = {
    method: 'POST',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'apiToken ' + this.token
    },
    json: obj
  };
  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

ApiAdapter.prototype.put = function (relativeUrl, obj, callback) {
  logger.debug('ApiAdapter PUT data ', relativeUrl);
  var opts = {
    method: 'PUT',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'apiToken ' + this.token
    },
    json: obj
  };
  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

ApiAdapter.prototype.delete = function (relativeUrl, callback) {
  var opts = {
    method: 'DELETE',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'apiToken ' + this.token
    }
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

function _performCall(bag, next) {
  var who = self.name + '|' + _performCall.name;
  logger.debug('Inside', who);

  bag.startedAt = Date.now();
  request(bag.opts,
    function (err, res, body) {
      var interval = Date.now() - bag.startedAt;
      logger.debug('ApiAdapter request ' + bag.opts.method + ' ' +
        bag.relativeUrl + ' took ' + interval +
        ' ms and returned HTTP status ' + (res && res.statusCode));

      bag.res = res;
      bag.body = body;
      if (res && res.statusCode > 299) err = err || res.statusCode;
      if (err) {
        logger.error('ApiAdapter returned status', err,
          'for request', bag.relativeUrl);
        bag.err = err;
      }
      return next();
    }
  );
}

function _parseResponse(bag, next) {
  var who = self.name + '|' + _parseResponse.name;
  logger.debug('Inside', who);
  if (bag.body) {
    if (typeof bag.body === 'object') {
      bag.parsedBody = bag.body;
    } else {
      try {
        bag.parsedBody = JSON.parse(bag.body);
      } catch (e) {
        logger.error('Unable to parse bag.body', bag.body, e);
        bag.err = e;
      }
    }
  }
  return next();
}

// Users
ApiAdapter.prototype.getUserById = function (id, callback) {
  var url = util.format('/users/%s', id);
  this.get(url, callback);
};
ApiAdapter.prototype.putUserById = function (id, obj, callback) {
  var url = util.format('/users/%s', id);
  this.put(url, obj, callback);
};
ApiAdapter.prototype.getUsers = function (callback) {
  var url = util.format('/users');
  this.get(url, callback);
};
ApiAdapter.prototype.postUser = function (obj, callback) {
  var url = util.format('/users');
  this.post(url, obj, callback);
};
ApiAdapter.prototype.deleteUserById = function (id, callback) {
  var url = util.format('/users/%s', id);
  this.delete(url, callback);
};
