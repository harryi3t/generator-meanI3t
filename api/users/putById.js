'use strict';

var self = putById;
module.exports = self;

var UserModel = require('./Model.js');
var apiAdapter = require('../common/ApiAdapter.js');

function putById(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: null,
  };

  bag.who = 'Users|' + self.name;
  logger.info(bag.who, 'Starting for objectId:', bag.inputParams.id);

  async.series([
      _checkInputParams.bind(null, bag),
      _put.bind(null, bag)
    ],
    function(err){
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
  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  apiAdapter = new ApiAdapter();


  return next();
}

function _put(bag, next) {
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  var oldUser = {_id: bag.inputParams.id};
  var newUser = bag.reqBody;

  UserModel.findOneAndUpdate(oldUser, newUser, {new: true},
    function (err, user) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, 'UserModel.create', err)
        );

      bag.resBody = user;
      return next();
    }
  );
}
