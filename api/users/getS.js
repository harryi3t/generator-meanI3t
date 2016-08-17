'use strict';

var self = getS;
module.exports = self;

var UserModel = require('./Model.js');

function getS(req, res) {
 var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: null,
  };

  bag.who = 'Users|' + self.name;
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getS.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return respondWithError(res, err);

      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  next();
}

function _getS(bag, next) {
  var who = bag.who + '|' + _getS.name;
  logger.verbose(who, 'Inside');

  UserModel.find(bag.inputParams.id,
    function (err, users) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, 'Database error', err)
        );

      bag.resBody = users;

      next();
    }
  );
}
