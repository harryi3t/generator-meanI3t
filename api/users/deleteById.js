'use strict';

var self = deleteById;
module.exports = self;

var UserModel = require('./Model.js');

function deleteById(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: null,
  };

  bag.who = 'Users|' + self.name;
  logger.info(bag.who, 'Starting for objectId:', bag.inputParams.id);

  async.series([
      _checkInputParams.bind(null, bag),
      _deleteById.bind(null, bag)
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

function _deleteById(bag, next) {
  var who = bag.who + '|' + _deleteById.name;
  logger.verbose(who, 'Inside');

  UserModel.findByIdAndRemove(bag.inputParams.id,
    function (err, user) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, 'Database error', err)
        );

      if (!user)
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'UserModel DELETE failed for :id ' + bag.inputParams.id)
        );
      bag.resBody = user;

      next();
    }
  );
}
